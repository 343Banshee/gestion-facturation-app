import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  subLabel,
  tone,
}: {
  label: string;
  value: string;
  subLabel?: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={tone === "warning" ? "text-2xl font-semibold text-destructive" : "text-2xl font-semibold"}>
          {value}
        </p>
        {subLabel && <p className="mt-1 text-xs text-muted-foreground">{subLabel}</p>}
      </CardContent>
    </Card>
  );
}
