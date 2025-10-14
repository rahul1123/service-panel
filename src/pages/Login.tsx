import LoginForm from "@/components/LoginForm";
const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          

          <div className="w-full ">
            <div className="lg:hidden mb-8"></div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
