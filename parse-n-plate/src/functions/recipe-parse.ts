export async function parseToHtml(url: string) {
  console.log("Parsing recipe to HTML:", url);
  const res = await fetch(`/api/parseToHtml?url=${encodeURIComponent(url)}`);
  return await res.json();
}

export async function parseRecipeToAi(url: string) {
  const res = await fetch(`/api/parseToAi?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  return data.result;
}