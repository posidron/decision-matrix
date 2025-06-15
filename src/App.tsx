import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Paper,
  Step,
  StepLabel,
  Stepper,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import CriteriaManager from "./components/CriteriaManager";
import ProductManager from "./components/ProductManager";
import Results from "./components/Results";
import ScoringMatrix from "./components/ScoringMatrix";
import { Criterion, Product, Score } from "./types";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#ec4899",
      light: "#f472b6",
      dark: "#db2777",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
  },
});

const steps = [
  "Add Products",
  "Define Criteria",
  "Score Products",
  "View Results",
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return products.length >= 2;
      case 1:
        return criteria.length >= 1;
      case 2:
        return scores.length === products.length * criteria.length;
      default:
        return true;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ProductManager products={products} setProducts={setProducts} />;
      case 1:
        return (
          <CriteriaManager criteria={criteria} setCriteria={setCriteria} />
        );
      case 2:
        return (
          <ScoringMatrix
            products={products}
            criteria={criteria}
            scores={scores}
            setScores={setScores}
          />
        );
      case 3:
        return (
          <Results products={products} criteria={criteria} scores={scores} />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              component="h1"
              align="center"
              sx={{ mb: 4, color: "white" }}
            >
              Decision Matrix
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{ mb: 6, color: "rgba(255, 255, 255, 0.8)" }}
            >
              Make informed decisions with weighted criteria analysis
            </Typography>
          </motion.div>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent(activeStep)}
              </motion.div>
            </AnimatePresence>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === steps.length - 1 || !canProceed()}
                size="large"
                sx={{
                  background:
                    "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
                  color: "white",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
                  },
                  "&:disabled": {
                    background: "rgba(0, 0, 0, 0.12)",
                    color: "rgba(0, 0, 0, 0.26)",
                  },
                }}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
