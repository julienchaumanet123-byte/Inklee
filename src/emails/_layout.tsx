import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const styles = {
  body: {
    backgroundColor: "#f7f7f5",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: 0,
    padding: "40px 20px",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  header: {
    backgroundColor: "#0a0a0a",
    padding: "32px 40px",
    textAlign: "center" as const,
  },
  logo: {
    color: "#ffffff",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "32px",
    fontWeight: 700 as const,
    letterSpacing: "-0.02em",
    margin: 0,
  },
  content: {
    padding: "40px",
  },
  footer: {
    backgroundColor: "#fafafa",
    borderTop: "1px solid #ececec",
    padding: "24px 40px",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#888",
    fontSize: "12px",
    margin: 0,
  },
};

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>Inklee</Text>
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Propulsé par Inklee · Le logiciel des tatoueurs français
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  h1: {
    color: "#0a0a0a",
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontWeight: 700 as const,
    lineHeight: "1.2",
    margin: "0 0 16px 0",
    letterSpacing: "-0.02em",
  },
  p: {
    color: "#333",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
  },
  small: {
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px 0",
  },
  box: {
    backgroundColor: "#fafafa",
    border: "1px solid #ececec",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
  },
  boxLabel: {
    color: "#888",
    fontSize: "11px",
    fontWeight: 600 as const,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    margin: "0 0 4px 0",
  },
  boxValue: {
    color: "#0a0a0a",
    fontSize: "16px",
    fontWeight: 500 as const,
    margin: "0 0 12px 0",
  },
  button: {
    backgroundColor: "#0a0a0a",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600 as const,
    padding: "12px 24px",
    textDecoration: "none",
    margin: "8px 0",
  },
};
