# Development

1. Clone the repo:

    ```sh
    git clone git@github.com:inloco/incognia-node.git
    ```

2. Install `pnpm`. Follow https://pnpm.io/installation

3. Install deps:

    ```sh
    cd incognia-node
    pnpm install
    ```

4. After making the desired changes, you should remember to update the package version:
   1. Update the package version in `package.json`
   2. Update the `version` variable inside the `src/version.ts` file. You can either do it manually or by running:

        ```sh
        pnpm genVersion
        ```

# Releases

OBS: Not every merged PR on `main` needs to be released. You might want to release a new version including many PRs.

That said, to release a new version, follow these steps:

1. Go to the releases page (https://github.com/inloco/incognia-node/releases)
2. Click on "Draft a new release"
3. On the "Choose a tag" dropdown, write the version you want to release preceded by "v" and create a new tag for it. Ex: you can write `v4.3.2` and click on "Create new tag: v4.3.2". Make sure the tag matches the version you have in your `package.json` file
4. Make sure the target is set to `master`
5. In the "Release title" input, type the name of the created tag
6. Click on "Generate release notes". Edit if needed
7. Click on "Publish release"

This will automatically push it to npm (See [actions](https://github.com/inloco/incognia-node/actions))
