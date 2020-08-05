export function impossible(cantBe: never): never {
    throw new Error(cantBe);
}
