export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  ux_mode?: "popup" | "redirect";
  auto_select?: boolean;
}

interface GoogleButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  width?: number;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
}

interface GoogleAccountsId {
  initialize: (configuration: GoogleIdConfiguration) => void;
  renderButton: (container: HTMLElement, options: GoogleButtonOptions) => void;
}

interface FacebookLoginResponse {
  authResponse?: { accessToken?: string } | null;
  status?: string;
}

interface FacebookProfile {
  id?: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string } };
}

interface FacebookSdk {
  init: (configuration: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: { scope: string },
  ) => void;
  api: (
    path: string,
    params: { fields: string },
    callback: (profile: FacebookProfile) => void,
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

const scriptPromises = new Map<string, Promise<void>>();
let facebookInitializedFor: string | null = null;

function loadScript(src: string, id: string, isReady: () => boolean): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Social sign-in is only available in the browser."));
  }

  if (isReady()) return Promise.resolve();

  const pending = scriptPromises.get(id);
  if (pending) return pending;

  const promise = new Promise<void>((resolve, reject) => {
    let script = document.getElementById(id) as HTMLScriptElement | null;
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      scriptPromises.delete(id);
      if (error) reject(error);
      else resolve();
    };

    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", () => finish(), { once: true });
    script.addEventListener("error", () => {
      script?.remove();
      finish(new Error(`Failed to load ${id}.`));
    }, { once: true });

    if (isReady()) finish();
  });

  scriptPromises.set(id, promise);
  return promise;
}

export async function renderGoogleSignInButton(
  container: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
): Promise<void> {
  await loadScript(
    "https://accounts.google.com/gsi/client",
    "google-identity-services",
    () => Boolean(window.google?.accounts?.id),
  );

  const accountsId = window.google?.accounts?.id;
  if (!accountsId) throw new Error("Google sign-in could not be initialized.");

  accountsId.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response?.credential) onCredential(response.credential);
    },
    ux_mode: "popup",
  });

  container.replaceChildren();
  accountsId.renderButton(container, {
    theme: "outline",
    size: "large",
    width: Math.min(container.clientWidth || 320, 400),
    text: "signin_with",
    shape: "rectangular",
    logo_alignment: "left",
  });
}

function initializeFacebookSdk(FB: FacebookSdk, appId: string) {
  if (facebookInitializedFor === appId) return;
  FB.init({ appId, cookie: true, xfbml: true, version: "v24.0" });
  facebookInitializedFor = appId;
}

export async function loadFacebookSdk(appId: string): Promise<FacebookSdk> {
  window.fbAsyncInit = () => {
    if (window.FB) initializeFacebookSdk(window.FB, appId);
  };

  await loadScript(
    "https://connect.facebook.net/en_US/sdk.js",
    "facebook-jssdk",
    () => Boolean(window.FB?.login),
  );

  const FB = window.FB;
  if (!FB) throw new Error("Facebook sign-in could not be initialized.");

  initializeFacebookSdk(FB, appId);
  return FB;
}

export interface SocialTokenRequest {
  provider: "google" | "facebook";
  token: string;
  email?: string;
  fullName?: string;
  profileImage?: string;
}

export async function requestFacebookToken(appId: string): Promise<SocialTokenRequest> {
  const FB = await loadFacebookSdk(appId);

  return new Promise<SocialTokenRequest>((resolve, reject) => {
    FB.login((response) => {
      const token = response.authResponse?.accessToken;
      if (!token) {
        reject(new Error("Facebook sign-in was cancelled."));
        return;
      }

      FB.api("/me", { fields: "id,name,email,picture.type(large)" }, (profile) => {
        resolve({
          provider: "facebook",
          token,
          email: profile?.email || undefined,
          fullName: profile?.name || undefined,
          profileImage: profile?.picture?.data?.url || undefined,
        });
      });
    }, { scope: "email,public_profile" });
  });
}
