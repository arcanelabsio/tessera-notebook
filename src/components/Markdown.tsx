import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

type Props = {
  source: string;
  // 'episode' — h2 is rendered as the section-h mono spaced-caps label
  //             (used by the Episode route)
  // 'inline'  — h2 stays as plain serif heading (used inside cards)
  variant?: "episode" | "inline";
};

// Drop the AST node prop react-markdown passes to custom components.
type MarkdownNodeProps<T extends keyof JSX.IntrinsicElements> =
  ComponentPropsWithoutRef<T> & { node?: unknown };

// Internal links (same-origin, starting with `/`) route through the SPA.
// External and anchor links fall through to plain <a>.
function LinkOrAnchor(props: MarkdownNodeProps<"a">) {
  const { href, children, node: _n, ...rest } = props;
  void _n;
  if (href && href.startsWith("/")) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

function sectionHeader(props: MarkdownNodeProps<"h2">) {
  const { children, id, node: _n } = props;
  void _n;
  return (
    <h2 className="section-h" id={id}>
      {children}
    </h2>
  );
}

// Every markdown table picks up `.md-table` for the editorial treatment
// (mono amber headers, mint-soft row-identity column, hairline dividers).
// This makes table styling a property of *the markdown component*, not
// of whichever surface wraps it — so any new route that renders <Markdown>
// gets correctly-formatted tables for free.
//
// Surface-specific overrides (`.mm-card` wrapper, `.intro-body` mobile
// stacking) still apply via higher specificity at their respective scopes.
function tableElement(props: MarkdownNodeProps<"table">) {
  const { children, node: _n, ...rest } = props;
  void _n;
  return (
    <table className="md-table" {...rest}>
      {children}
    </table>
  );
}

function plainComponents(): Components {
  return { a: LinkOrAnchor, table: tableElement };
}

function episodeComponents(): Components {
  return { a: LinkOrAnchor, h2: sectionHeader, table: tableElement };
}

export function Markdown({ source, variant = "episode" }: Props) {
  const components = variant === "episode" ? episodeComponents() : plainComponents();
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkFrontmatter]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ]}
      components={components}
    >
      {source}
    </ReactMarkdown>
  );
}
