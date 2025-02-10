import { parseArgs } from "util";
import { rm, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const args = parseArgs({
  args: Bun.argv,
  options: {
    target: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const target = args.positionals[2];
if (target !== "chrome" && target !== "firefox") {
  console.error("Usage: bun run build.ts {chrome|firefox}");
  process.exit(1);
}

async function isExists(path: string): Promise<boolean> {
  const file = Bun.file(path);
  return await file.exists();
}

async function checkFile(path: string): Promise<void> {
  if (!(await isExists(path))) {
    console.error(`${path} not found`);
    process.exit(1);
  }
}

async function checkDirectory(dirPath: string): Promise<boolean> {
  try {
    await readdir(dirPath);
    return true;
  } catch {
    return false;
  }
}

await checkDirectory(path.resolve("assets", "images"));
await checkDirectory(path.resolve("assets", "scripts"));
await checkDirectory(path.resolve("assets", "styles"));
await checkDirectory(path.resolve("assets", target));
await checkFile(path.resolve("assets", target, "manifest.json"));
await checkFile(path.resolve("assets", "info.html"));
await checkFile("tsconfig.json");

if (await isExists("output")) {
  await rm("output", { recursive: true, force: true });
}
await mkdir("output", { recursive: true });

const tsc = Bun.spawnSync({ cmd: ["tsc"], stdout: "pipe", stderr: "pipe" });
if (tsc.exitCode !== 0) {
  console.error(new TextDecoder().decode(tsc.stderr));
  process.exit(tsc.exitCode);
}

async function copyPath(src: string, dest: string): Promise<void> {
  const info = await Bun.file(src).stat();
  if (info.isDirectory()) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.resolve(src, entry.name);
      const destPath = path.resolve(dest, entry.name);
      await copyPath(srcPath, destPath);
    }
  } else {
    const data = await Bun.file(src);
    await Bun.write(dest, data);
  }
}

await copyPath(
  path.resolve("assets", "images"),
  path.resolve("output", "images"),
);
await copyPath(
  path.resolve("assets", "scripts"),
  path.resolve("output", "scripts"),
);
await copyPath(
  path.resolve("assets", "styles"),
  path.resolve("output", "styles"),
);
await copyPath(
  path.resolve("assets", target, "manifest.json"),
  path.resolve("output", "manifest.json"),
);
await copyPath(
  path.resolve("assets", "info.html"),
  path.resolve("output", "info.html"),
);

console.log("Build completed successfully");
