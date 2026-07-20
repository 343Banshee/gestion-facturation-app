"use client";

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type FieldValues,
  type Path,
  type ArrayPath,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, toCents } from "@/lib/money";
import { EMPTY_LINE, type DocumentLineValues } from "@/lib/validations/quote.schema";

export type CatalogueItem = {
  id: string;
  name: string;
  description: string | null;
  unitPriceCents: number;
  unit: string;
};

type WithLines = { lines: DocumentLineValues[] };

export function DocumentLineEditor<TFieldValues extends FieldValues & WithLines>({
  control,
  register,
  catalogueItems,
  lineValues,
  setValue,
}: {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  catalogueItems: CatalogueItem[];
  lineValues: DocumentLineValues[];
  setValue: UseFormSetValue<TFieldValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines" as ArrayPath<TFieldValues>,
  });

  function applyCatalogueItem(index: number, itemId: string) {
    const item = catalogueItems.find((i) => i.id === itemId);
    if (!item) return;
    setValue(`lines.${index}.serviceItemId` as Path<TFieldValues>, item.id as never);
    setValue(
      `lines.${index}.description` as Path<TFieldValues>,
      (item.description || item.name) as never,
    );
    setValue(`lines.${index}.unitPrice` as Path<TFieldValues>, (item.unitPriceCents / 100) as never);
    setValue(`lines.${index}.unit` as Path<TFieldValues>, item.unit as never);
  }

  const subtotalCents = lineValues.reduce((sum, line) => {
    const qty = Number(line.quantity) || 0;
    const price = toCents(Number(line.unitPrice) || 0);
    return sum + Math.round(qty * price);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Catalogue</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Qté</TableHead>
              <TableHead className="w-28">Unité</TableHead>
              <TableHead className="w-32">Prix unit. HT</TableHead>
              <TableHead className="w-28 text-right">Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const line = lineValues[index];
              const lineTotalCents = Math.round(
                (Number(line?.quantity) || 0) * toCents(Number(line?.unitPrice) || 0),
              );
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <Select
                      items={Object.fromEntries(catalogueItems.map((i) => [i.id, i.name]))}
                      onValueChange={(value: string | null) =>
                        value && applyCatalogueItem(index, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Libre" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogueItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      {...register(`lines.${index}.description` as Path<TFieldValues>)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.quantity` as Path<TFieldValues>, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input {...register(`lines.${index}.unit` as Path<TFieldValues>)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.unitPrice` as Path<TFieldValues>, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(lineTotalCents)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_LINE as never)}
        >
          <Plus className="h-4 w-4" />
          Ajouter une ligne
        </Button>
        <p className="text-sm">
          Total HT :{" "}
          <span className="text-base font-semibold">{formatMoney(subtotalCents)}</span>
        </p>
      </div>
    </div>
  );
}
