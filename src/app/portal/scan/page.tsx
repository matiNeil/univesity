import { QrScanner } from "@/components/qr-scanner";

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-4 text-sm text-muted-foreground">
        Point the camera at a visitor&apos;s QR pass. Each pass can only be used once.
      </p>
      <QrScanner stationName="Gate 1" />
    </div>
  );
}
