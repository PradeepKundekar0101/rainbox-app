"use client";
import { useOnboarding } from "@/context/onboardingContext";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// Replacing Lucide with Heroicons
import { CheckIcon } from "@heroicons/react/24/solid";

import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/authContext";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
export const Onboardingmodal = () => {
  const {
    isOnboardingComplete,
    setCurrentStep,
    nextStep,
    previousStep,
    checkUserName,
    updateUserName,
    currentStep,
  } = useOnboarding();
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setUserNameError("Username cannot be empty");
      return;
    }

    if (isUsernameValid) {
      updateUserName(user?.id || "", userName);
      nextStep();
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUserName(newUsername);
    if (!newUsername.trim()) {
      setUserNameError("Username cannot be empty");
    }
  };

  const completeOnboarding = () => {
    // In a real app, you would mark onboarding as complete in the database
    // For now, we'll just close the modal or redirect
    window.location.href = "/dashboard"; // You can replace this with actual redirection logic
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-md">
            <h3 className="text-sm text-gray-800 font-semibold border-b pb-2">
              Create your Newsletter email address
            </h3>
            <p className="text-sm text-gray-800">
              Subscribe to newsletters with this email address
            </p>

            <form onSubmit={handleUsernameSubmit} className="space-y-md">
              <div className="flex relative">
                <Input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={userName}
                  onChange={handleUsernameChange}
                  className={`text-black focus:outline-none text-sm focus:ring-0 !outline-none rounded-r-none ${!isUsernameValid && userName.trim() && !isCheckingUsername ? "border-destructive" : isUsernameValid && userName.trim() && !isCheckingUsername ? "border-primaryBlue" : ""}`}
                  disabled={isCheckingUsername}
                />
                <div className="bg-gray-100 flex items-center px-3 rounded-r-md">
                  @rainbox.in
                </div>

                {isCheckingUsername && (
                  <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
                    {/* Replaced Loader2 with a simple loading spinner */}
                    <svg className="h-4 w-4 text-primaryBlue animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {isCheckingUsername && (
                <p className="text-primaryBlue text-sm ">
                  Checking username availability...
                </p>
              )}
              {userNameError && !isCheckingUsername && (
                <p className="text-destructive text-sm text-gray-800">{userNameError}</p>
              )}
              {!isUsernameValid && userName.trim() && !isCheckingUsername ? (
                <p className="text-sm  text-amber-600">
                  <span className="font-medium">Already taken.</span> Please try
                  a different email address
                </p>
              ) : null}
              <Alert variant="default">
                <AlertTitle>Important:</AlertTitle>
                <AlertDescription>
                  You won't be able to change this email address later
                </AlertDescription>
              </Alert>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isCheckingUsername || !isUsernameValid || !userName.trim()
                }
              >
                {isCheckingUsername ? "Checking..." : "Next"}
              </Button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-md">
            <h3 className="text-sm text-gray-800 font-semibold border-b pb-2">
              Get your newsletters from Gmail or Outlook to Rainbox
            </h3>

            <div className="bg-gray-100 rounded-md p-sm text-center mb-4">
              [Image Placeholder]
            </div>

            <p className="text-sm text-gray-800">
              You can set email forwarding rules to automatically send your
              newsletter emails from Gmail and Outlook to Rainbox
            </p>

            <ul className="list-disc list-inside space-y-md text-sm text-gray-800">
              <li>
                Instructions for email forwarding:
                <ul className="list-inside ml-5 mt-1">
                  <li>
                    <a href="#" className="text-primaryBlue hover:underline">
                      Gmail
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primaryBlue hover:underline">
                      Outlook
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                Pro Tip: Add a '+newsletter_name' to the rainbox email address
                to uniquely identify the newsletters
                <p className="mt-1">
                  Example:{" "}
                  <span className="text-primaryBlue">{userName}@rainbox.app</span>
                  +newslettername@rainbox.app
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  *Auto-populated with your rainbox email address
                </p>
              </li>
            </ul>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                disabled={currentStep === 2}
                variant="outline"
                onClick={previousStep}
              >
                Back
              </Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-md">
            <h3 className="text-muted-foreground font-semibold border-b pb-2">
              Upgrade to Pro for the best experience
            </h3>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="border rounded-lg p-sm">
                <h4 className="font-medium">Free Plan</h4>
                <p className="font-bold">FREE</p>
                <ul className="mt-4 space-y-md">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>10 Newsletters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>50 email history per Newsletter</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-sm border-blue-200 bg-blue-50">
                <h4 className="font-medium">Pro Plan</h4>
                <div className="flex items-center gap-2">
                  <p className="font-bold">$20/year</p>
                  <span className="text-sm text-gray-800 text-muted-foreground">$2.5/mo</span>
                </div>
                <ul className="mt-4 space-y-md">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Unlimited Newsletters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Unlimited history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>AI Summary</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    <span>Text to Speech</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={previousStep}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={completeOnboarding}>
                  Continue with Free plan
                </Button>
                <Button
                  className="bg-primaryBlue hover:bg-blue-600"
                  onClick={completeOnboarding}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Onboarding</DialogTitle>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
            <div
              className="bg-primaryBlue h-2 rounded-full"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </DialogHeader>
        <DialogDescription>{renderStep()}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};