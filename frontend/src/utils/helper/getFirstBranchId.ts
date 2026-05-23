import Cookies from "js-cookie";

/**
 * Returns the ID of the first branch from the branchesList cookie
 * @returns {number | undefined} First branch ID or undefined if no branches
 */
export const getFirstBranchId = (): number | undefined => {
  try {
    const branchCookie = Cookies.get("branchesList");
    if (!branchCookie) return undefined;

    const parsedBranches = JSON.parse(branchCookie);
    if (Array.isArray(parsedBranches) && parsedBranches.length > 0) {
      return parsedBranches[0].id;
    }
  } catch (error) {
    console.error("Error reading branchesList cookie:", error);
  }
  return undefined;
};
