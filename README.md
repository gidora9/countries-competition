# Behavioral Governance Map

> A high-fidelity, interactive data visualization engine mapping global corruption, geopolitical identity, macroeconomics, and societal wellbeing.

![Status: Deployed](https://img.shields.io/badge/Status-Deployed-00f2ff?style=flat-square)
![Live API: World Bank](https://img.shields.io/badge/Live_API-World_Bank-4ade80?style=flat-square)
![Stack: React & Tailwind](https://img.shields.io/badge/Stack-React_%7C_Tailwind-blue?style=flat-square)

## Overview

The **Behavioral Governance Map** is a dynamic, physics-driven data visualization tool that evaluates 180 countries across multiple sovereign dimensions. Moving beyond standard static reports, this application pulls live macro-data and renders it in a highly fluid, responsive force-directed interface.

Users can cross-examine how Governance Systems (Regimes) and Geographic Regions correlate with absolute metrics like the Corruption Perceptions Index (CPI), GDP per capita (PPP), and Global Happiness indices.

## Core Features

- **Live World Bank API Sync:** Dynamically fetches precise GDP per capita (PPP) data (`NY.GDP.PCAP.PP.CD`) in real-time, overriding static baselines to ensure macroeconomic accuracy.
- **Multi-Axis Physics Engine:** Transforms tabular data into a fluid, animated beeswarm layout. Instantly remaps the Y-axis between CPI, GDP, Happiness, and Meaningful Life metrics while maintaining node identity.
- **Dynamic Structural Grouping:** Break the graph apart physically by clustering countries horizontally based on their geographic region or underlying governance framework.
- **Glassmorphic Data Cards:** Premium, responsive hover states and mobile views that synthesize 5 distinct data points per node simultaneously.
- **Normalized Data Baselines:** Integrates and normalizes disparate data sets from world-leading academic and financial institutions to prevent distinct bounds bias.

## Data Sources & Methodology

All underlying data is composite-normalized across peer-reviewed methodologies to ensure analytical integrity:

*   **Corruption & Regime:** V-Dem Institute (v14), World Bank (WGI), Transparency International (CPI), EIU Democracy Index
*   **Macroeconomics:** Penn World Table (10.0), IMF World Economic Outlook, World Bank (ICP)
*   **Wellbeing & Affect:** World Values Survey (WVS-7), Oxford Wellbeing Research Centre, Gallup World Poll

## Tech Stack

*   **Framework:** React 18 / TypeScript
*   **Styling:** Tailwind CSS (custom dark-mode glassmorphic aesthetic)
*   **Animations/Transitions:** Framer Motion / SVG physics interpolations
*   **Build Tool:** Vite

## Usage

1. **Select a Dimension (Y-Axis):** Use the left control panel to switch the primary vertical axis between Corruption, GDP, or Happiness.
2. **Apply a Grouping (X-Axis):** Click "By System" or "By Region" to split the data horizontally into distinct vertical clusters.
3. **Inspect Nodes:** Hover over any country's flag to open the detailed data-card revealing its exact scores, trends, and real-time fetched stats.
