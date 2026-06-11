import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	allowedDevOrigins: ["localhost"],
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
