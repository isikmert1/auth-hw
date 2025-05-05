
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Enter your details to get started"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
