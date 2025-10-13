import { Link } from "@/components/ui/link";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex'>
      Hello "/_auth/login"!
      <Link to='/register' variant='button' size='icon'>
        register
      </Link>
    </div>
  );
}
