// require.context é resolvido pelo bundler do Remotion (rspack/webpack)
declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
  ): { keys(): string[]; <T>(id: string): T };
};
