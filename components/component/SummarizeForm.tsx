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
import { simulateProgress } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

const SummarizerForm = () => {
  const [summarizedText, setSummarizedText] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [inputValue, setinputValue] = useState("");
  const [Progress, setProgress] = useState(0);
  const [Error, setError] = useState("");
  const [showTickIcon, setShowTickIcon] = useState(false);

  const toast = useToast();

  function CopyToClipboard(text: string) {
    try {
      navigator.clipboard.writeText(text).then(
        () => {
          toast.toast({
            title: "Амжилттай хуулагдлаа ",
          });
        },
        (err) => {
          console.log(err);
          toast.toast({
            title: "Алдаа гарлаа",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      console.log(error);
      toast.toast({
        title: "Алдаа гарлаа ",
        variant: "destructive",
      });
    }
  }

  const handleCopyClick = () => {
    CopyToClipboard(summarizedText.toString());
    setShowTickIcon(true);

    setTimeout(() => {
      setShowTickIcon(false);
    }, 3000);
  };

  const HandleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setisLoading(true);
      setSummarizedText("");
      setError("");

      const progressInterval = simulateProgress(90, setProgress);
      const res = await fetch("/api/summarize", {
        method: "POST",
        body: inputValue,
      });

      if (!res.ok) {
        // Handle errors here if the response status is not okay
        console.error("Error: " + res.status);
        console.error((await res.json()).error);
        setError("Алдаа гарлаа");
        clearInterval(progressInterval);
        setisLoading(false);
        toast.toast({
          title: "Алдаа гарлаа",
          description: "Алдаа гарлаа",
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();

      toast.toast({
        title: "Амжилттай үүссэн",
        description: "Амжилттай",
      });
      // Clean Up
      setProgress(100);
      setisLoading(false);
      clearInterval(progressInterval);
      setSummarizedText(data.text);
      console.log(data);
    } catch (error) {
      setError("Алдаа гарлаа");
    }
  };

  const HandleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError("");
    if (e.target.value.length >= 500) {
      const truncatedInput = e.target.value.slice(0, 500);

      setinputValue(truncatedInput);
      return setError("Дээд үг 500");
    }
    setinputValue(e.target.value);
  };

  return (
    <div className=" w-full flex flex-col ">
      <div>
        <div className=" mb-5 items-center h-max  ">
          {" "}
          <h1 className=" text-2xl "> Хураангуйлагч</h1>
          <p className=" text-gray-500 text-xs md:text-sm">
          
          </p>
        </div>
        <form onSubmit={HandleSubmit} className=" flex flex-col gap-6 sticky">
          <div className=" flex flex-col w-full">
            <Textarea
              value={inputValue}
              // className="text-black"
              placeholder="Хураангуйлхыг хүссэн текст..."
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
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Хөрвүүлэх
              </div>
            ) : (
              <div className="flex items-center">
                <Pencil1Icon className="mr-2 h-4 w-4 " /> Бичвэрийг хөрвүүлэх
              </div>
            )}
          </Button>
        </form>
      </div>

      <div className=" mt-4 flex-1 h-full flex flex-col gap-3 relative">
        <h2 className="">Output</h2>

        <div className=" w-full h-full mt-2 relative ">
          <div
            className="absolute right-3 bg-black/70 cursor-pointer p-2  rounded-full top-3"
            onClick={handleCopyClick}
          >
            {showTickIcon ? <CheckIcon /> : <CopyIcon />}
          </div>
          <Textarea
            readOnly
            tabIndex={-1}
            value={summarizedText}
            className=" bg-secondary w-full min-h-[200px] !focus-visible:outline-none focus-visible:ring-0  !focus-visible:border-none"
          ></Textarea>
        </div>
      </div>
    </div>
  );
};

export default SummarizerForm;
