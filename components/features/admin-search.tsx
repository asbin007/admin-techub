"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import qs from "query-string";

const formSchema = z.object({
  search: z.string(),
});

export default function AdminSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: currentSearch,
    },
  });

  // Update form value when URL changes
  useEffect(() => {
    form.setValue("search", currentSearch);
  }, [currentSearch, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const url = qs.stringifyUrl({
      url: window.location.href,
      query: {
        search: values.search || undefined,
      },
    }, { skipNull: true });

    router.push(url);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          {...form.register("search")}
        />
      </div>
    </form>
  );
}