'use client'
import {Button} from "@/components/ui/button";
import {MoveRight} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {parseToHtml, parseRecipeToAi} from "@/functions/recipe-parse";

export default function SearchForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    try {
      setLoading(true)
      console.log("loading", loading);
      const recipeDataHtml = await parseToHtml(url)
      console.log("Parsed Recipe HTML:", recipeDataHtml.html)
      const recipeResult = await parseRecipeToAi(recipeDataHtml.html);
      console.log("Parsed Recipe:", recipeResult)
      // TODO: do something with this, like store in state or show on UI
    } catch (err) {
      console.error(err)
      alert("Error parsing recipe")
    } finally {
      setLoading(false)
    }
  }

  return(
    <div className="flex gap-2 w-full">
      <Input
        type="string"
        placeholder="Url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        className="bg-yellow-400 hover:bg-yellow-300 cursor-pointer active:scale-90 transition"
        onClick={handleParse}
      >
        <MoveRight color="black"/>
      </Button>
    </div>
  )
}