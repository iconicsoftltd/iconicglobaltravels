import {
  ChangePasswordSchemaType,
  changePasswordSchema,
} from "@/components/schemas/user/changePasswordSchema";
import { useChangePasswordMutation } from "@/components/store/api/user/userApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export const ChangePasswordPage = () => {
  const [changePassword, { isLoading: changePasswordLoading }] =
    useChangePasswordMutation();

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ChangePasswordSchemaType) => {
    try {
      const result = await changePassword(data).unwrap();
      toast.success(
        result?.message || "Password has been changed successfully!"
      );
      form.reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change password");
    }
  };

  return (
 <div className="max-w-2xl mx-auto mt-10">
  <Card className="rounded-2xl border shadow-sm overflow-hidden">

    {/* Header */}
    <CardHeader className="bg-gradient-to-r from-primary-50 to-white px-6 py-5 border-b">
      <CardTitle className="text-lg font-semibold text-gray-800">
        Change Password
      </CardTitle>
      <p className="text-sm text-gray-500 mt-1">
        Update your password to keep your account secure
      </p>
    </CardHeader>

    <CardContent className="p-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="space-y-6">

            {/* Old Password */}
            <FormField
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter current password"
                      className="h-11 rounded-lg px-3
                      border-gray-300 focus:border-primary
                      focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter new password"
                      className="h-11 rounded-lg px-3
                      border-gray-300 focus:border-primary
                      focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm new password"
                      className="h-11 rounded-lg px-3
                      border-gray-300 focus:border-primary
                      focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">

            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="rounded-lg px-5"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={changePasswordLoading}
              className="rounded-lg px-6 bg-primary text-white hover:opacity-90"
            >
              {changePasswordLoading ? "Updating..." : "Update Password"}
            </Button>

          </div>
        </form>
      </Form>
    </CardContent>
  </Card>
</div>
  );
};

export default ChangePasswordPage;
