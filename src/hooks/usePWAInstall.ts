import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log("PWA Install Hook initialized");

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const installed = isStandalone || isIOSStandalone;

      console.log("PWA Installation check:", {
        isStandalone,
        isIOSStandalone,
        installed,
        displayMode: window.matchMedia("(display-mode: standalone)").media,
      });

      setIsInstalled(installed);
      return installed;
    };

    const installed = checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired!", e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log("PWA is now installable");
    };

    const handleAppInstalled = () => {
      console.log("appinstalled event fired!");
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Check if beforeinstallprompt is supported
    if ("serviceWorker" in navigator) {
      console.log("Service Worker supported");
    } else {
      console.log("Service Worker NOT supported");
    }

    console.log("Adding event listeners for PWA events");
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For testing purposes, let's also check if we're in a PWA-capable environment
    console.log("PWA Environment check:", {
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      serviceWorkerSupported: "serviceWorker" in navigator,
      userAgent: navigator.userAgent.substring(0, 100) + "...",
    });

    // Simulate installable state for testing (remove this in production)
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Development mode: simulating installable state after 1 second"
      );
      const devTimer = setTimeout(() => {
        if (!installed) {
          console.log(
            "Development mode: setting installable to true for testing"
          );
          setIsInstallable(true);
        }
      }, 1000);

      return () => {
        clearTimeout(devTimer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      console.log("Removing PWA event listeners");
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    console.log("installApp called, deferredPrompt:", !!deferredPrompt);

    if (!deferredPrompt) {
      console.log("No deferred prompt available");
      return false;
    }

    try {
      console.log("Showing install prompt...");
      // Show the install prompt
      await deferredPrompt.prompt();

      console.log("Waiting for user choice...");
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User choice outcome:", outcome);

      if (outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error installing PWA:", error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
  };
};
