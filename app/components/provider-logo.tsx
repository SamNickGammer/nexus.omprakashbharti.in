import type { Provider } from "@/lib/providers";

// Brand mark for a provider: real simple-icons glyph, or a branded monogram
// tile for the ones without an available logo.
export function ProviderLogo({ provider }: { provider: Provider }) {
  if (provider.icon) {
    return (
      <span
        className="grid h-10 w-10 place-items-center border border-edge bg-bg"
        style={{ color: provider.brand }}
      >
        <svg role="img" viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
          <path d={provider.icon.path} />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="grid h-10 w-10 place-items-center border text-[11px] font-bold"
      style={{ color: provider.brand, borderColor: provider.brand }}
    >
      {provider.mono}
    </span>
  );
}
