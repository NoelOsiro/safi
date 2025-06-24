// src/lib/server/oauth.js
"use server";

import { createAdminClient } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

export async function signUpWithMicrosoft() {
	const { account } = await createAdminClient();

  	const origin = (await headers()).get("origin");
  
	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Microsoft,
		`${origin}/api/auth/callback`,
		`${origin}/login`,
	);

	console.log(redirectUrl);
	return redirectUrl;
};
