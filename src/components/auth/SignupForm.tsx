import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Calendar, Check, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const nameRegex = /^[a-zA-Z\s'-]+$/; 
const uppercaseRegex = /(?=.*[A-Z])/;
const lowercaseRegex = /(?=.*[a-z])/;
const numberRegex = /(?=.*\d)/;
const specialCharRegex = /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/;

const formSchema = z.object({
  firstName: z.string()
    .min(2, { message: "First name must be at least 2 characters" })
    .regex(nameRegex, { message: "First name can only contain letters, spaces, hyphens, or apostrophes" }),
  lastName: z.string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .regex(nameRegex, { message: "Last name can only contain letters, spaces, hyphens, or apostrophes" }),
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  birthDay: z.string().min(1, {
    message: "Day is required"
  }),
  birthMonth: z.string().min(1, {
    message: "Month is required"
  }),
  birthYear: z.string().min(1, {
    message: "Year is required"
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(uppercaseRegex, { message: "Password must contain at least one uppercase letter" })
    .regex(lowercaseRegex, { message: "Password must contain at least one lowercase letter" })
    .regex(numberRegex, { message: "Password must contain at least one number" })
    .regex(specialCharRegex, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine(data => {
  const day = parseInt(data.birthDay);
  const month = parseInt(data.birthMonth) - 1; 
  const year = parseInt(data.birthYear);
  const date = new Date(year, month, day);
  return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
}, {
  message: "Please enter a valid date",
  path: ["birthDay"]
}).refine(data => {
  const day = parseInt(data.birthDay);
  const month = parseInt(data.birthMonth) - 1;
  const year = parseInt(data.birthYear);
  const inputDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate <= today;
}, {
  message: "Date cannot be in the future",
  path: ["birthYear"]
}).refine(data => {
  const day = parseInt(data.birthDay);
  const month = parseInt(data.birthMonth) - 1;
  const year = parseInt(data.birthYear);
  const inputDate = new Date(year, month, day);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 110);
  minDate.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= minDate;
}, {
  message: "Date cannot be more than 110 years ago",
  path: ["birthYear"]
});

type FormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState(""); 
  const navigate = useNavigate();

  const days = Array.from({
    length: 31
  }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const months = Array.from({
    length: 12
  }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const currentYear = new Date().getFullYear();
  const years = Array.from({
    length: 111
  }, (_, i) => (currentYear - i).toString());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log("Signup form submitted:", data);

    const usersDatabaseStr = localStorage.getItem('usersDatabase');
    const usersDatabase = usersDatabaseStr ? JSON.parse(usersDatabaseStr) : {};

    if (usersDatabase[data.email]) {
      toast({
        title: "Signup Failed",
        description: "This email address is already registered.",
        variant: "destructive",
      });
      return;
    }

    usersDatabase[data.email] = {
      credentials: {
        email: data.email,
        password: data.password,
      },
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        birthDay: data.birthDay,
        birthMonth: data.birthMonth,
        birthYear: data.birthYear,
      },
    };

    localStorage.setItem('usersDatabase', JSON.stringify(usersDatabase));

    toast({
      title: "Signup Successful",
      description: "Your account has been created. Please log in.",
    });
    navigate('/login');
  };

  const passwordCheck = useMemo(() => {
    const value = passwordValue || ""; 
    return {
      length: value.length >= 8,
      uppercase: uppercaseRegex.test(value),
      lowercase: lowercaseRegex.test(value),
      number: numberRegex.test(value),
      specialChar: specialCharRegex.test(value),
    };
  }, [passwordValue]);

  const renderCheckItem = (isValid: boolean, text: string) => (
    <div className={cn("flex items-center text-sm", isValid ? "text-green-600" : "text-muted-foreground")}>
      {isValid ? <Check className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
      {text}
    </div>
  );

  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem className="form-group">
              <Label htmlFor="firstName">First Name</Label>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    className="pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem className="form-group">
              <Label htmlFor="lastName">Last Name</Label>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    className="pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem className="form-group">
            <Label htmlFor="email">Email</Label>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  className="pl-10" 
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="">
          <Label>Date of Birth</Label>
          <div className="grid grid-cols-3 gap-2">
            <FormField control={form.control} name="birthDay" render={({ field }) => (
              <FormItem className="form-group">
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger aria-label="Day"> 
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[240px]">
                      {days.map(day => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="birthMonth" render={({ field }) => (
              <FormItem className="form-group">
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger aria-label="Month"> 
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[240px]">
                      {months.map(month => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="birthYear" render={({ field }) => (
              <FormItem className="form-group">
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger aria-label="Year"> 
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[240px]">
                      {years.map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem className="form-group">
            <Label htmlFor="password">Password</Label>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e); 
                    setPasswordValue(e.target.value);
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />

            {form.watch('password') && (
              <div className="mt-2 space-y-1">
                {renderCheckItem(passwordCheck.length, "At least 8 characters")}
                {renderCheckItem(passwordCheck.lowercase, "At least one lowercase letter")}
                {renderCheckItem(passwordCheck.uppercase, "At least one uppercase letter")}
                {renderCheckItem(passwordCheck.number, "At least one number")}
                {renderCheckItem(passwordCheck.specialChar, "At least one special character")}
              </div>
            )}
            
          </FormItem>
        )} />

        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem className="form-group">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  {...field}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="auth-alternate">
        Already have an account?{" "}
        <Link to="/login" className="font-medium">
          Sign in
        </Link>
      </div>
    </Form>;
};
export default SignupForm;