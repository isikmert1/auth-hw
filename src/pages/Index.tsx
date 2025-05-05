
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 auth-container">
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Authentication System</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          A modern and sleek authentication system with login and signup functionality.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
