'use client';

import { Nullable } from 'lib/interfaces';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import nProgress from 'nprogress';
import { ComponentProps } from 'react';
import { UrlObject } from 'url';
import { Link, useRouter } from './navigation';

const getHrefRetainingCurrentSearchParams = (
  href: string | UrlObject,
  currentSearchParams?: Nullable<ReadonlyURLSearchParams | URLSearchParams>,
  retainSearchParams?: boolean | string[],
) => {
  const hrefString = typeof href === 'string' ? href : href.toString();
  if (!retainSearchParams) return hrefString;

  const searchParamsToRetain = Array.from(currentSearchParams ?? []).filter(([key]) =>
    Array.isArray(retainSearchParams) ? retainSearchParams.includes(key) : true,
  );

  const [path, search] = hrefString.split('?');
  const mergedSearchParams = new URLSearchParams({
    ...Object.fromEntries(searchParamsToRetain),
    ...Object.fromEntries(new URLSearchParams(search)),
  });
  return `${path}?${mergedSearchParams.toString()}`;
};

export function CsrLink(props: ComponentProps<typeof Link> & { retainSearchParams?: boolean | string[] }) {
  const searchParams = useSearchParams();
  const resolvedHref = getHrefRetainingCurrentSearchParams(props.href, searchParams, props.retainSearchParams);
  return <Link {...props} href={resolvedHref} />;
}

export function useCsrRouter() {
  const router = useRouter();

  const push = (
    href: string,
    options?: Parameters<typeof router.push>[1] & { showProgress?: boolean; retainSearchParams?: boolean | string[] },
  ): ReturnType<typeof router.push> => {
    if (options?.showProgress !== false) nProgress.start();
    const searchParams = new URLSearchParams(window.location.search);
    const resolvedHref = getHrefRetainingCurrentSearchParams(href, searchParams, options?.retainSearchParams);
    return router.push(resolvedHref, options);
  };

  const replace = (
    href: string,
    options?: Parameters<typeof router.replace>[1] & {
      showProgress?: boolean;
      retainSearchParams?: boolean | string[];
    },
  ): ReturnType<typeof router.replace> => {
    if (options?.showProgress !== false) nProgress.start();
    const searchParams = new URLSearchParams(window.location.search);
    const resolvedHref = getHrefRetainingCurrentSearchParams(href, searchParams, options?.retainSearchParams);
    return router.replace(resolvedHref, options);
  };

  return { ...router, push, replace };
}
