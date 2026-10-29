<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Serve the fixed dataset Excel through its Lovable Assets pointer and a shared download control outside DataGate so downloads remain available when live CSV loading fails.
- Keep source releases dataset-free through public asset pointers and README links; PUBLIC_RELEASE_IGNORE.txt documents exclusions to merge into the platform-protected .gitignore before GitHub sync.
