"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScanResult = {
  valid: boolean;
  reason?: "invalid" | "already_used" | "revoked";
  visitor?: { name: string; relationship: string };
  graduate?: { name: string };
  ceremony?: string;
  seat?: { section: string | null; row: string | null; number: string | null };
};

const READER_ID = "qr-reader";

export function QrScanner({ stationName }: { stationName: string }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualToken, setManualToken] = useState("");
  const lastTokenRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5QrcodeScanner | null = null;
    let cancelled = false;

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (cancelled) return;
      scanner = new Html5QrcodeScanner(READER_ID, { fps: 10, qrbox: 250 }, false);
      scanner.render(
        (decodedText) => submitToken(decodedText),
        () => {}
      );
    });

    return () => {
      cancelled = true;
      scanner?.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitToken(token: string) {
    if (busyRef.current || token === lastTokenRef.current) return;
    busyRef.current = true;
    lastTokenRef.current = token;

    try {
      const res = await fetch("/api/graduation/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, stationName }),
      });
      const data: ScanResult = await res.json();
      setResult(data);
    } finally {
      setTimeout(() => {
        lastTokenRef.current = null;
        busyRef.current = false;
      }, 2500);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div id={READER_ID} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex gap-2 pt-6">
          <Input
            placeholder="Manual token entry (offline fallback)"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <Button
            onClick={() => {
              if (manualToken.trim()) submitToken(manualToken.trim());
            }}
          >
            Validate
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card
          className={cn(
            "border-4",
            result.valid ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"
          )}
        >
          <CardContent className="flex flex-col gap-1 pt-6 text-center">
            <p className="text-2xl font-bold">
              {result.valid
                ? "✅ VALID GRADUATION PASS"
                : result.reason === "already_used"
                ? "❌ PASS ALREADY USED"
                : result.reason === "revoked"
                ? "❌ PASS REVOKED"
                : "❌ INVALID PASS"}
            </p>
            {result.visitor && (
              <>
                <p>Visitor: {result.visitor.name} ({result.visitor.relationship})</p>
                <p>Graduate: {result.graduate?.name}</p>
                <p>Ceremony: {result.ceremony}</p>
                {result.seat?.section && (
                  <p>Seat: Section {result.seat.section}, Row {result.seat.row}, Seat {result.seat.number}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
