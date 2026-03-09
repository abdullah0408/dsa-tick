import { TooltipProvider } from "./ui/tooltip";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

export default Providers;
