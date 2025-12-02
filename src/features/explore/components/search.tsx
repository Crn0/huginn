import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/utils/cn";

import { useDebounce } from "use-debounce";
import {
  useUsers,
  getUsersFilterSchema,
  type GetUserFilter,
} from "@/features/users/api/get-users";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UserAvatar } from "@/components/ui/avatar/user-avatar";
import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";

export interface SearchProps {
  isFocus: boolean;
  focus: (value: boolean) => void;
}

export function Search({ isFocus, focus}: SearchProps) {
  const navigate = useNavigate({ from: "/explore" });
  const search = useSearch({ from: "/_protected/explore" });

  const form = useForm({
    resolver: zodResolver(getUsersFilterSchema),
    defaultValues: {
      searchTerm: search.q ?? "",
    },
  });

  const searchTerm = (form.watch("searchTerm") ?? "").trim();

  const [enableNavigate, setEnableNavigate] = useState(false)
  const [debouncedTerm] = useDebounce(searchTerm, 800);

  const usersQuery = useUsers(debouncedTerm, debouncedTerm.length > 0);

  const users =
    usersQuery.data?.data ?? [];

  const showResults = usersQuery.isEnabled && isFocus

  const onSubmit = (data: GetUserFilter) => {
    if (data.searchTerm) {
      return navigate({
        search: { q: data.searchTerm, f: search.f },
        replace: true,
      });
    }

    navigate({ to: ".", search: { f: search.f } });
  };

  return (
    <Command
      className={cn("overflow-initial sm:p-5 sm:h-2/6", !isFocus && "h-9")}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;

        focus(false);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;

        focus(false);
      }}
      shouldFilter={false}
    >
      <Controller
        control={form.control}
        name='searchTerm'
        render={({ field: { onChange, ...rest } }) => (
          <CommandInput
            {...rest}
            placeholder='Search'
            onValueChange={(value) => {
              focus(true)
              onChange(value)
            }}
            onFocus={() => {
              focus(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                  form.handleSubmit(onSubmit)(e)
                  focus(false)
              }

              if (e.key === "ArrowDown") {
                setEnableNavigate(true)
              }

                
            }}
          />
        )}
      />

      {showResults && (
        <CommandList className='border-border h-full max-h-full rounded-lg border '>
          {!usersQuery.isLoading && !usersQuery.isError && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {
            !usersQuery.isLoading && usersQuery.isError && <CommandEmpty className="break-all p-5">{`Search for "${debouncedTerm}"`}</CommandEmpty>
          }

          {users.length <=0 && usersQuery.isLoading && (
            <CommandEmpty className='grid place-content-center-safe place-items-center-safe'>
              <Spinner className='text-spinner size-10' />
            </CommandEmpty>
          )}

          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() =>
                 {
                  if (enableNavigate) {
                    navigate({
                    to: "/$username",
                    params: { username: user.username },
                  })
                  }
                 }
                }
                tabIndex={0}
                asChild
              >
                <Link
                  className='bg-background text-foreground focus-visible:ring-0'
                  to='/$username'
                  params={{ username: user.username }}
                >
                  <div>
                    <UserAvatar
                      className='h-15 w-15'
                      avatar={user.profile.avatarUrl}
                      fallback={user.username}
                    />
                  </div>
                  <div className='flex flex-col items-start'>
                    <span className='font-bold'>
                      {user.profile.displayName}
                    </span>
                    <span className='font-light opacity-50'>
                      @{user.username}
                    </span>
                  </div>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
}
