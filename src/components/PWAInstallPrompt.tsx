import {
  AddToHomeScreen as AddIcon,
  Close as CloseIcon,
  GetApp as InstallIcon,
  PhoneIphone as PhoneIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallPromptProps {
  appName?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  appName = "Decision Matrix",
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [installButtonVisible, setInstallButtonVisible] = useState(true);
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = (window.navigator as any).standalone;

  useEffect(() => {
    // Check if user has dismissed the install button
    const installButtonDismissed = localStorage.getItem(
      "pwa-install-button-dismissed"
    );
    if (installButtonDismissed) {
      setInstallButtonVisible(false);
    }

    // Debug logging
    console.log("PWA Install Prompt Debug:", {
      isMobile,
      isInstallable,
      isInstalled,
      hasBeenDismissed,
      installButtonVisible,
      isIOS,
      isInStandaloneMode,
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
    });

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const remindLater = localStorage.getItem("pwa-install-remind-later");

    if (dismissed) {
      setHasBeenDismissed(true);
      console.log("PWA prompt previously dismissed permanently");
      return;
    }

    // Check if remind later is still active
    if (remindLater) {
      const remindTime = new Date(remindLater);
      if (new Date() < remindTime) {
        console.log("PWA prompt in remind-later period until:", remindTime);
        return;
      } else {
        // Remove expired remind-later
        localStorage.removeItem("pwa-install-remind-later");
      }
    }

    // Show prompt on mobile devices when app is installable OR on iOS (for manual instructions)
    const shouldShow =
      isMobile &&
      !isInstalled &&
      !hasBeenDismissed &&
      (isInstallable || (isIOS && !isInStandaloneMode));

    if (shouldShow) {
      console.log("PWA prompt conditions met, showing in 2 seconds...");
      const timer = setTimeout(() => {
        console.log("Showing PWA install prompt");
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      console.log("PWA prompt not shown because:", {
        isMobile: !isMobile ? "not mobile" : "is mobile",
        isInstallable: !isInstallable ? "not installable" : "is installable",
        isInstalled: isInstalled ? "already installed" : "not installed",
        hasBeenDismissed: hasBeenDismissed ? "was dismissed" : "not dismissed",
        isIOS: isIOS ? "is iOS" : "not iOS",
        isInStandaloneMode: isInStandaloneMode
          ? "in standalone"
          : "not standalone",
      });
    }
  }, [
    isMobile,
    isInstallable,
    isInstalled,
    hasBeenDismissed,
    isIOS,
    isInStandaloneMode,
    installButtonVisible,
  ]);

  const handleInstall = async () => {
    console.log("User clicked install button");

    if (isIOS) {
      // For iOS, we can't programmatically install, so we keep the dialog open
      // to show instructions
      console.log("iOS detected - showing manual instructions");
      return;
    }

    const success = await installApp();
    console.log("Install result:", success);
    if (success) {
      setShowPrompt(false);
      // Hide the install button after successful installation
      setInstallButtonVisible(false);
      localStorage.setItem("pwa-install-button-dismissed", "true");
    } else {
      // If install failed, show manual instructions
      console.log(
        "Install failed - this might be expected in development mode"
      );
    }
  };

  const handleDismiss = () => {
    console.log("User dismissed PWA prompt permanently");
    setShowPrompt(false);
    setHasBeenDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
    // Also hide the install button
    setInstallButtonVisible(false);
    localStorage.setItem("pwa-install-button-dismissed", "true");
  };

  const handleRemindLater = () => {
    console.log("User chose remind later for PWA prompt");
    setShowPrompt(false);
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem("pwa-install-remind-later", tomorrow.toISOString());
  };

  const handleCloseButton = () => {
    console.log("Install button dismissed by user via X button");
    setInstallButtonVisible(false);
    localStorage.setItem("pwa-install-button-dismissed", "true");
  };

  const renderIOSInstructions = () => (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        To install {appName} on your iPhone or iPad:
      </Typography>

      <Stepper orientation="vertical" sx={{ pl: 0 }}>
        <Step active>
          <StepLabel
            icon={<ShareIcon sx={{ color: "primary.main" }} />}
            sx={{ pl: 0 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Tap the Share button
            </Typography>
          </StepLabel>
          <StepContent sx={{ pl: 4, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Look for the share icon{" "}
              <ShareIcon sx={{ fontSize: 16, mx: 0.5 }} /> in Safari's toolbar
            </Typography>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel
            icon={<AddIcon sx={{ color: "primary.main" }} />}
            sx={{ pl: 0 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Select "Add to Home Screen"
            </Typography>
          </StepLabel>
          <StepContent sx={{ pl: 4, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Scroll down in the share menu and tap "Add to Home Screen"
            </Typography>
          </StepContent>
        </Step>

        <Step active>
          <StepLabel
            icon={<PhoneIcon sx={{ color: "primary.main" }} />}
            sx={{ pl: 0 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Tap "Add" to confirm
            </Typography>
          </StepLabel>
          <StepContent sx={{ pl: 4 }}>
            <Typography variant="body2" color="text.secondary">
              The app will be added to your home screen like a native app!
            </Typography>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );

  const renderAndroidInstructions = () => (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Get the best experience by installing {appName} on your device. It will
        work offline and feel like a native app!
      </Typography>

      <Box
        sx={{
          bgcolor: "primary.50",
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "primary.100",
        }}
      >
        <Typography
          variant="body2"
          color="primary.main"
          sx={{ fontWeight: 500 }}
        >
          ✨ Benefits:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          • Works offline • Faster loading • Native app experience • No browser
          bars
        </Typography>
      </Box>
    </Box>
  );

  // Don't render if already installed or conditions not met
  if (isInstalled) {
    console.log("PWA prompt not rendering: app is already installed");
    return null;
  }

  // In development mode, always show a test button on mobile
  if (process.env.NODE_ENV === "development" && isMobile) {
    console.log("Development mode: showing test button and dialog");

    return (
      <>
        {installButtonVisible && (
          <Box
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<InstallIcon />}
              onClick={() => {
                console.log("Install as App button clicked, showing prompt");
                setShowPrompt(true);
              }}
              sx={{
                background: "transparent",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                borderRadius: "12px 0 0 12px",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "none",
                },
              }}
            >
              Install as App
            </Button>
            <IconButton
              size="small"
              onClick={handleCloseButton}
              sx={{
                color: "white",
                padding: "4px",
                borderRadius: "0 12px 12px 0",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}

        <Dialog
          open={showPrompt}
          onClose={handleRemindLater}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              mx: 2,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <InstallIcon color="primary" />
                <Typography variant="h6" component="span">
                  Install {appName}
                </Typography>
              </Box>
              <IconButton
                onClick={handleDismiss}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 0 }}>
            {isIOS ? renderIOSInstructions() : renderAndroidInstructions()}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={handleRemindLater}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              {isIOS ? "Maybe later" : "Remind me later"}
            </Button>
            {!isIOS && (
              <Button
                onClick={handleInstall}
                variant="contained"
                startIcon={<InstallIcon />}
                sx={{
                  textTransform: "none",
                  background:
                    "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
                  },
                }}
              >
                Install App
              </Button>
            )}
            {isIOS && (
              <Button
                onClick={() => {
                  handleRemindLater();
                  // Also hide the install button after user acknowledges iOS instructions
                  setInstallButtonVisible(false);
                  localStorage.setItem("pwa-install-button-dismissed", "true");
                }}
                variant="contained"
                sx={{
                  textTransform: "none",
                  background:
                    "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
                  },
                }}
              >
                Got it!
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Production logic - only show if conditions are met
  if (!isMobile || (!isInstallable && !(isIOS && !isInStandaloneMode))) {
    console.log("PWA prompt not rendering in production mode:", {
      isMobile,
      isInstallable,
      isIOS,
      isInStandaloneMode,
      nodeEnv: process.env.NODE_ENV,
    });
    return null;
  }

  console.log("PWA prompt rendering in production mode");
  return null;
};

export default PWAInstallPrompt;
