import {
  siGithub,
  siVercel,
  siSupabase,
  siNeon,
  siCloudflare,
  siHostinger,
  siGodaddy,
  type SimpleIcon,
} from "simple-icons";
import { CONNECTABLE } from "./connectors";

// The provider catalog (doc/04). `icon` is a simple-icons brand mark where one
// exists; the rest fall back to a branded monogram tile. `connectable` is
// derived from the connector registry.
export type Provider = {
  key: string;
  name: string;
  category: string;
  desc: string;
  brand: string; // hex
  icon?: SimpleIcon;
  mono?: string;
};

export const PROVIDERS: Provider[] = [
  { key: "github", name: "GitHub", category: "Source", desc: "Repositories, branches, and commit activity.", brand: `#${siGithub.hex}`, icon: siGithub },
  { key: "vercel", name: "Vercel", category: "Hosting", desc: "Projects, deployments, and production domains.", brand: "#ffffff", icon: siVercel },
  { key: "neon", name: "Neon", category: "Database", desc: "Postgres projects, branches, and databases.", brand: `#${siNeon.hex}`, icon: siNeon },
  { key: "supabase", name: "Supabase", category: "Database", desc: "Projects, tables, and edge functions.", brand: `#${siSupabase.hex}`, icon: siSupabase },
  { key: "cloudflare", name: "Cloudflare", category: "DNS & Network", desc: "Zones, DNS records, and SSL status.", brand: `#${siCloudflare.hex}`, icon: siCloudflare },
  { key: "hostinger", name: "Hostinger", category: "Hosting", desc: "Websites, VPS, and hosting plans.", brand: `#${siHostinger.hex}`, icon: siHostinger },
  { key: "godaddy", name: "GoDaddy", category: "Domains", desc: "Domain registrations and expiry.", brand: `#${siGodaddy.hex}`, icon: siGodaddy },
  { key: "slack", name: "Slack", category: "Notifications", desc: "Route alerts to channels.", brand: "#4A154B", mono: "SL" },
  { key: "aws", name: "AWS", category: "Cloud", desc: "Accounts, EC2, RDS, and S3 inventory.", brand: "#FF9900", mono: "AWS" },
  { key: "azure", name: "Azure", category: "Cloud", desc: "Subscriptions and resource groups.", brand: "#0078D4", mono: "AZ" },
  { key: "manual_vps", name: "Manual VPS", category: "Servers", desc: "Track any server by IP + SSH metadata.", brand: "#12e0ea", mono: "VPS" },
];

export function getProvider(key: string): Provider | undefined {
  return PROVIDERS.find((p) => p.key === key);
}

export function isConnectable(key: string): boolean {
  return CONNECTABLE.includes(key);
}
