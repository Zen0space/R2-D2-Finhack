import { cn } from "@/lib/utils";

type InviteQrProps = {
  code: string;
  className?: string | undefined;
};

const GRID_SIZE = 13;

function hashSeed(seed: string) {
  return seed.split("").reduce((hash, character) => {
    return (hash * 33 + character.charCodeAt(0)) >>> 0;
  }, 5381);
}

function isFinderCell(row: number, column: number) {
  const isTopLeft = row <= 3 && column <= 3;
  const isTopRight = row <= 3 && column >= GRID_SIZE - 4;
  const isBottomLeft = row >= GRID_SIZE - 4 && column <= 3;

  return isTopLeft || isTopRight || isBottomLeft;
}

function isFinderFill(row: number, column: number) {
  const localRow = row < 4 ? row : row - (GRID_SIZE - 4);
  const localColumn = column < 4 ? column : column - (GRID_SIZE - 4);
  const edge = localRow === 0 || localRow === 3 || localColumn === 0 || localColumn === 3;
  const center = localRow >= 1 && localRow <= 2 && localColumn >= 1 && localColumn <= 2;

  return edge || center;
}

export function InviteQr({ className, code }: InviteQrProps) {
  const seed = hashSeed(code);
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
    const row = Math.floor(index / GRID_SIZE);
    const column = index % GRID_SIZE;

    if (isFinderCell(row, column)) {
      return isFinderFill(row, column);
    }

    const bit = (seed >> ((row + column + index) % 16)) & 1;
    return (row + column + bit) % 2 === 0;
  });

  return (
    <div
      className={cn(
        "grid aspect-square rounded-[1.75rem] border border-[color:var(--dl-sand)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
    >
      {cells.map((isFilled, index) => (
        <span
          aria-hidden="true"
          className={cn("rounded-[2px]", isFilled ? "bg-[color:var(--dl-ink)]" : "bg-transparent")}
          key={`${code}-${index}`}
        />
      ))}
    </div>
  );
}
