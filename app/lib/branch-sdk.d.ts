// Ambient types for branch-sdk (the Branch Web SDK ships no TypeScript types and
// there is no @types/branch-sdk). We declare only the surface the /invite bridge
// uses, so this documents our integration rather than the whole SDK.
declare module "branch-sdk" {
  type BranchError = { message: string } | null;

  // Deep-link data attached to a generated link. `data` carries our custom
  // params (referral_code) alongside Branch's $-prefixed reserved keys.
  type LinkData = {
    channel?: string;
    feature?: string;
    campaign?: string;
    data?: Record<string, string | number | undefined>;
  };

  interface Branch {
    init(
      branchKey: string,
      options?: Record<string, unknown>,
      callback?: (err: BranchError, data: unknown) => void,
    ): void;
    link(data: LinkData, callback: (err: BranchError, link: string | null) => void): void;
  }

  const branch: Branch;
  export default branch;
}
