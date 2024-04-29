"use client";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  CopyIcon,
  Pencil1Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Progress as ProgressElement } from "@/components/ui/progress";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { cn, simulateProgress } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

type Response = {
  score: Score;
  positiveScore: {
    label: string;
    score: number;
  }[];
};

type Score = {
  label: string;
  score: string;
  meaning: string;
  emoji: string;
}[];

const ClassificationForm = () => {
  const [ScoreArr, setScoreArr] = useState<Score | []>();

  const [isLoading, setisLoading] = useState(false);
  const [inputValue, setinputValue] = useState("");
  const [Progress, setProgress] = useState(0);
  const [Error, setError] = useState("");
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [Processed, setProcessed] = useState(false);
  const toast = useToast();

  const HandleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setisLoading(true);
      setScoreArr([]);
      setError("");

      const progressInterval = simulateProgress(90, setProgress);
      const res = await fetch("/api/classify", {
        method: "POST",
        body: inputValue,
      });

      if (!res.ok || res.status !== 200) {
        // Handle errors here if the response status is not okay
        console.error("Error: " + res.status);
        console.error((await res.json()).error);
        setError("Дахиад оролдоод үздээ");
        clearInterval(progressInterval);
        setisLoading(false);
        toast.toast({
          title: "Алдаа галаа",
          description: "???",
          variant: "destructive",
        });
        return;
      }

      const data: Response = await res.json();

      toast.toast({
        title: "Амжилттай ",
        description: "Хураангуйлсан",
      });
      // Clean Up
      setProgress(100);
      setisLoading(false);
      clearInterval(progressInterval);
      setScoreArr(data.score);
      setIsPositive(() => data.positiveScore[0].label === "POSITIVE");
      console.log(data);
    } catch (error) {
      setError("Дахиад оролдож үзнэ үү");
    } finally {
      setProcessed(true);
    }
  };

  const HandleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError("");
    if (e.target.value.length >= 500) {
      return setError("Дээд үг нь 500");
    }
    setinputValue(e.target.value);
  };

  return (
    <div className=" w-full flex flex-col ">
      <div>
        <div className=" mb-5 items-center h-max  ">
          {" "}
          <div className=" flex  gap-4 items-center">
            <h1 className=" text-2xl ">Ангилагч</h1>
            {/* <p className=" bg-green-600 text-background  capitalize border-transparent   shadow  inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2  ">
              Beta
            </p> */}
          </div>
          {/* <p className=" text-red-300 text-xs">
            {" "}
            NOTE: This is currently beta and can generate unexpected behaviors
            we are working on this model to make it better
          </p> */}
        </div>
        <form onSubmit={HandleSubmit} className=" flex flex-col gap-6 sticky">
          <div className=" flex flex-col w-full">
            <Textarea
              value={inputValue}
              // className="text-black"
              placeholder="Ангилах текст..."
              required
              className=" min-h-[200px]"
              onChange={HandleChange}
            />
            <p className="text-sm text-muted-foreground mt-1 text-red-500">
              {Error}
            </p>
            {isLoading ? (
              <ProgressElement
                value={Progress}
                className=" h-1 transition-all duration-200"
              />
            ) : null}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Ажиллаж байна
              </div>
            ) : (
              <div className="flex items-center">
                <Pencil1Icon className="mr-2 h-4 w-4 " /> Бичвэр
              </div>
            )}
          </Button>
        </form>
      </div>

      <div className=" mt-4 flex-1 h-full flex flex-col gap-3 relative">
        {Processed ? <h2 className="">Output</h2> : ""}

        <div className=" w-full h-full mt-2 relative space-y-3 ">
          <div className=" flex gap-5 items-center">
            {isPositive !== null ? (
              <p
                className={cn(
                  " capitalize border-transparent   shadow  inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ",
                  isPositive
                    ? "bg-green-500 text-background"
                    : "bg-destructive text-destructive-foreground "
                )}
              >
                {isPositive ? "Positive" : "Negative"}
              </p>
            ) : null}
          </div>
          {Processed && ScoreArr?.length === 0
            ? "We Can't Find Emotions For Above Text"
            : ""}

          {ScoreArr?.map((item) => {
            return (
              <div key={item.label} className=" flex gap-5 items-center">
                <p className=" capitalize  flex flex-shrink-0 min-w-[100px]">
                  {item.emoji} {item.label}
                </p>{" "}
                <ProgressElement value={parseInt(item.score)} />
                <p>{item.score}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassificationForm;
