import {parseArgs} from "util"
import {rm, mkdir, readdir} from "node:fs/promises";

const args = parseArgs({
    args: Bun.argv,
    options: {
        target: {
            type: "string"
        }
    },
    strict: true,
    allowPositionals: true,
})

const target = args.positionals[2]
if (target !== "chrome" && target !== "firefox") {
    console.error("Usage: bun run build.ts {chrome|firefox}")
    process.exit(1);
}

async function isExists(path: string): Promise<boolean> {
    const file = await Bun.file(path);
    return await file.exists();
}

async function checkFile(path: string): Promise<void> {
    if (!(await isExists(path))) {
        console.error(`${path} not found`)
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

await checkDirectory("assets\\images")
await checkDirectory("assets\\scripts")
await checkDirectory("assets\\styles")
await checkDirectory(`assets\\${target}`)
await checkFile(`assets\\${target}\\manifest.json`)
await checkFile("tsconfig.json")

if (await isExists("output")) {
    await rm('output', {recursive: true, force: true})
}
await mkdir("output", {recursive: true})

const tsc = Bun.spawnSync({cmd: ["tsc"], stdout: "pipe", stderr: "pipe"})
if (tsc.exitCode !== 0) {
    console.error(new TextDecoder().decode(tsc.stderr))
    process.exit(tsc.exitCode);
}

async function copyPath(src: string, dest: string): Promise<void> {
    const info = await Bun.file(src).stat();
    if (info.isDirectory()) {
        await mkdir(dest, { recursive: true });
        const entries = await readdir(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = `${src}\\${entry.name}`;
            const destPath = `${dest}\\${entry.name}`;
            await copyPath(srcPath, destPath);
        }
    } else {
        const data = await Bun.file(src);
        await Bun.write(dest, data);
    }
}

await copyPath("assets\\images", "output\\images")
await copyPath("assets\\scripts", "output\\scripts")
await copyPath("assets\\styles", "output\\styles")
await copyPath(`assets\\${target}\\manifest.json`, "output\\manifest.json")

console.log("Build completed successfully")
