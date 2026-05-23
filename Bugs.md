# Bug #1 Report: Ledger Dropdown Shows Only 10 of 15
Root cause: hardcoded size=10 default with no override at the call site.

Two-layer problem:

1. Backend — ledger.controller.ts:84


const take = parseInt(size as string) || 10;
Default page size is 10. No isActive filter — all ledgers included, so that's not the issue.

2. Frontend API — ledgerApi.ts:21


query: ({ page = 1, size = 10, search = "" }) => {
Default size=10.

3. Call site — CreateParticularAccountModal.tsx:100


useGetAllLedgersQuery({})
Called with empty {} — so size falls back to 10. Only first page (10 ledgers) loads. The other 5 never get fetched.

Summary: Dropdown is paginated but modal only fetches page 1 with size 10. No "load more" or "fetch all" logic exists. 15 ledgers exist → only 10 shown.

Fix options (for when you're ready):

Pass size: 100 (or some safe large number) in the modal's query call — quick fix
Add a dedicated "get-all-for-select" backend endpoint with no pagination (like getParticularsForSelectService already does for particulars) — cleaner long-term
Add search/infinite scroll to the dropdown

# Bug #2 Report: Voucher Particulars Dropdown Failures
Why Journal Works But Others Don't — The Core Difference
Journal Voucher uses useGetParticularOptionsQuery → hits /particular/particular-options → no ledger type filter, returns ALL particulars for the branch (up to 50).

Every other voucher uses filtered particular endpoints that only return particulars linked to a specific ledger type. If no particulars were created under those exact ledger types, the dropdown is empty.

1. Receipt Voucher — CreateReceiptVoucherList.tsx:57-60
Row	Data Source	Backend Filter
Dr	useGetAllAccountsParticularQuery	Particulars whose ledger is "Petty Cash", "Cash In Hand", or "Cash At Bank" only
Cr	useGetAllCustomerParticularQuery	Particulars whose ledger is "Accounts Receivable" only
Root cause: If no particulars exist linked to those specific ledger types, options is an empty array. The Command + CommandItem component then renders zero items and cmdk shows "No results." Searching for "re" doesn't help — client-side filtering runs on zero items.

Secondary issue: CommandItem has no explicit value prop — line 246-265. cmdk falls back to children text for filtering but this is fragile.

2. Payment Voucher — CreatePaymentVoucher.tsx:51-54
Row	Data Source	Backend Filter
Row 0 (Dr)	useGetAllAccountsParticularQuery	Cash/Petty Cash/Bank particulars only
Row 1+ (Cr)	useGetAllSupplierParticularQuery	"Accounts Payable" ledger only
Root cause: Same as Receipt — dropdown is empty if no particulars exist under those exact ledger types. Uses Select (not Command) so no cmdk issue, but items simply never appear.

3. Contra Voucher — CreateContraVoucher.tsx:49-50
Both rows use useGetAllAccountsParticularQuery — correct for a Contra (Cash ↔ Bank transfer). But line 196:


const options = isAccount ? accounts?.data : accounts?.data;
Both sides always resolve to accounts?.data (the ternary is a no-op — same value either side). This is intentional and correct for Contra. But if no Cash/Bank particulars exist, both dropdowns are empty. The user never gets to create a Contra entry because the dataset has no particulars in those ledger types.

4. Expense Voucher — CreateExpanseVoucher.tsx:52-55 — Worst Bug: Reversed Slots
```
const { data: accounts } = useGetAllAccountsParticularQuery({});   // Cash/Bank
const { data: customers } = useGetAllExpenseParticularQuery({});   // Expense categories
```

Then line 201-203:

```
const isAccount = index === 0;
const options = isAccount ? accounts?.data : customers?.data;
```
Row	isAccount	Gets data from	What it shows
Dr (row 0)	true	accounts = Cash/Bank particulars	Empty (or Cash/Bank)
Cr (row 1)	false	customers = Expense particulars	"Office Expense", etc.
The Dr and Cr data sources are flipped. Accounting logic requires:

Dr = Expense category (what you spent on)
Cr = Cash/Bank (what you paid from)
But the code does the opposite. This directly explains both symptoms: Dr is empty (Cash/Bank particulars — likely none created), and Cr shows "Office Expense" (expense data is in the Cr slot).

Summary Table
Voucher	API Used	Why It Breaks
Journal ✅	getParticularOptions	No filter — returns all particulars
Receipt ❌	getAllAccountsParticular + getAllCustomerParticular	Filters by ledger type — empty if no matching particulars exist
Payment ❌	getAllAccountsParticular + getAllSupplierParticular	Same
Contra ❌	getAllAccountsParticular (both rows)	Same — plus user may not have Cash/Bank particulars set up
Expense ❌	Both above + Dr/Cr assignment reversed	Two bugs: filter + wrong data in wrong slot
The Underlying Architectural Problem
Four vouchers rely on particulars pre-created under very specific ledger types ("Petty Cash", "Cash In Hand", "Cash At Bank", "Accounts Receivable", "Accounts Payable"). If those particulars haven't been created in the system, the dropdowns are empty — silently. Journal bypasses this by using the unfiltered endpoint. The filtered endpoints return data shaped as { id, accountType, balance, ledger: {...} } while Journal's endpoint returns { label, value, balance } — inconsistent shapes across voucher modules.

# Bug #3 Report: VAT & Tax Field — Flat Addition Instead of Percentage Calculation
Root Cause #1: Wrong Formula — CreateEditPurchase.tsx:326-327

const totalAmount = rows.reduce((sum, r) => sum + r.totalPrice, 0);
const netAmount = totalAmount + vat;
vat is raw state from the input — whatever number the user typed. It gets added directly to totalAmount. No percentage conversion exists anywhere. There is no totalAmount * (vat / 100) calculation. The formula hardwired in the code is:


Net Amount = Total Amount + vat_input_value
When user types 15, it adds 15 BDT. When user expects 15%, the code needs:


Net Amount = Total Amount + (Total Amount × vat / 100)
That line simply doesn't exist.

Root Cause #2: vat State is Completely Disconnected from rows — line 105 vs line 326
```
const [vat, setVat] = useState(0);           // separate local state
const totalAmount = rows.reduce(...);         // derived from rows
const netAmount = totalAmount + vat;          // computed inline at render
```

totalAmount is recalculated at each render from rows. vat is a separate number that just sits independently. They're combined only at render time with +. No reactive link exists between them — if totalAmount changes (user adds/removes products), vat value stays the same raw number, not re-percentaged. This is the "product list clears leading to 0.00" secondary symptom: user types VAT first while rows are empty → totalAmount = 0 → netAmount = 0 + 15 = 15. Later when products are added, vat is still just 15 not recalculated as % of new total.

Root Cause #3: Handler Just Passes the Raw Value Through — line 371-374
```
const handleVatChange = (value: number) => {
  setVat(value);           // stores raw input
  setValue("vat", value);  // sends raw value to form + backend
};
```
No conversion at any point in the chain — UI to state to form to backend. Backend receives 15 and stores 15. The field is semantically a percentage but is stored and used as an absolute amount everywhere.

Root Cause #4: Input Field Has No % Indicator — line 755-761
```
<Label>VAT & Tax</Label>
<Input
  type="number"
  value={vat === 0 ? "" : vat}
  onChange={(e) => handleVatChange(Number(e.target.value))}
  className="w-1/3 text-right"
/>
```
No % symbol, no placeholder saying "Enter percentage", no hint. User sees a blank number field next to "Total Amount" and reasonably assumes it works like a percentage field (since it's labelled "VAT & Tax"). Nothing in the UI disambiguates it.

Summary
Layer	Problem
Formula	netAmount = totalAmount + vat — flat add, no × vat/100
State design	vat is a static number, not recalculated when rows change
Handler	Raw input passed straight through, no conversion
UI	No % indicator, no placeholder — ambiguous field intent
Backend	Receives and stores the raw number as-is — no conversion there either
All four layers need to be fixed together. Fixing only the formula would show correct on screen but send the wrong vat value to the backend (still raw %). Fixing formula and handler together would solve both display and persistence.

# Bug #4 Report: Newly Created Supplier Not Appearing in Select Supplier Dropdown
This bug has three compounding causes, each independently capable of hiding the new particular.

Root Cause #1: Wrong Ledger Selected — Modal Has No Guardrail
The user selected "Client" as the ledger in the modal. That particular gets saved in the DB under whatever ledger type "Client" maps to.

Now look at what the "Select Supplier" dropdown actually fetches — particularAccountApi.ts:78-91:

```
getAllSupplierParticular: builder.query({
  query: ({ page = 1, size = 1000, search = "" }) => {
    ...
    return { url: `/particular/get-supplier-all${queryParams}` };
  },
})
And the backend getAllSupplier controller — particular.controller.ts:229-232:
```

```
const particulars = await prisma.particular.findMany({
  where: {
    ledger: {
      ledgerType: "Accounts Payable",   // ← HARD FILTER
    },
    branchId: Number(branchId),
  },
  ```

The supplier dropdown ONLY returns particulars whose ledger has ledgerType = "Accounts Payable". The user's newly created "Emad" particular is linked to a "Client" ledger. It will never match this filter — not on first load, not after page refresh, not ever — because it's in the wrong bucket in the DB.

The modal CreateParticularAccountModal.tsx:99-100 shows ALL ledgers with no filtering or guidance:


const { data: ledgersData } = useGetAllLedgersQuery({});
User sees a generic ledger list, picks "Client," creation succeeds, but the record is permanently invisible to the supplier query.

Root Cause #2: The Ledger "Accounts Payable" May Not Even Appear in the Modal — The Pagination Bug Again
The modal calls useGetAllLedgersQuery({}) — empty args → defaults to size=10, fetches only first 10 ledgers. If "Accounts Payable" is not in those first 10 (ordered by createdAt desc), it doesn't appear in the modal at all. User literally cannot select the correct ledger even if they know to. This is the same pagination bug from Issue #1.

Root Cause #3: Even With Correct Ledger, Cache Invalidation Doesn't Reach the Parent
The modal fires useCreateParticularMutation which invalidates the "particular" tag. useGetAllSupplierParticularQuery provides the "particular" tag — so RTK Query should refetch.

But the modal is mounted inside a Dialog inside CreateEditPurchaseForm. After onClose() is called, the dialog unmounts. Whether RTK Query triggers the refetch before or after the component holding the query unmounts depends on timing. In practice this is unreliable — the parent CreateEditPurchaseForm is the component subscribed to useGetAllSupplierParticularQuery, and it doesn't explicitly re-query after the modal closes. There's no refetch() call or any reactive trigger in the parent after setIsModalOpen(false).

Root Cause #4: Search Logic Looks at Wrong Field on Frontend
Even if a supplier somehow appeared in the list, look at the search filter in the parent form — CreateEditPurchase.tsx:554-558:


?.filter((item: any) =>
  item.accountType
    ?.toLowerCase()
    .includes(partySearch.toLowerCase()),
)
The new particular was created with Account Name = "Emad", Company = "Emad Express". The filter only searches accountType. If the user typed the company name instead, it also wouldn't match. This is minor compared to the others, but adds to confusion.

Summary Table
#	Root Cause	Effect	Survives Refresh?
1	Particular created under "Client" ledger, query hard-filters for "Accounts Payable"	Record exists in DB but is invisible to supplier query	Yes — permanent
2	Modal ledger dropdown only fetches 10 ledgers — "Accounts Payable" may be absent	User can't even select the correct ledger	Yes
3	No explicit refetch after modal close	New supplier doesn't appear without manual refresh	No — refresh would help IF cause #1/#2 were fixed
4	Search only matches accountType, not companyName	Correct record could still be unsearchable	Yes
The core design flaw: The "Create Particular" modal is generic — works for any account type — but when launched from the Purchase form's "+" button, it needs to be supplier-specific (forced ledger = "Accounts Payable"). No such constraint exists. The modal has no context awareness of where it was opened from.