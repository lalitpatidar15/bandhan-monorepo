import ReduxProvider from "./redux/provider";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
