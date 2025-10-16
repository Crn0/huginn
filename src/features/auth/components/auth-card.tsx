import type { ReactNode } from "react";
import { env } from "@/configs/env";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleSvg } from "@/components/ui/google";
import { Separator } from "@/components/ui/separator";

export interface AuthCardProps {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
}

const API_VERSION = `v${env.API_VERSION}` as const;
const GOOGLE_URL = `${env.SERVER_URL}/api/${API_VERSION}/auth/google` as const;

export function AuthCard({ title, footer, content }: AuthCardProps) {
  return (
    <Card className='w-full bg-black text-white sm:max-w-md'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Button variant='secondary' className='w-full' asChild>
          <a href={GOOGLE_URL}>
            <GoogleSvg /> Continue with Google
          </a>
        </Button>

        <Separator className='my-4' />

        {content}
      </CardContent>

      <CardFooter className='gap-2'>{footer}</CardFooter>
    </Card>
  );
}
