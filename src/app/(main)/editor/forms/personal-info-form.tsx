/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { personalInformSchema, PersonalInfoValues } from "@/lib/validations";
import { EditorFormProps } from "types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";

export default function PersonalInfoForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInformSchema),
    defaultValues: {
      firstName: resumeData.firstName || "",
      lastName: resumeData.lastName || "",
      jobTitle: resumeData.jobTitle || "",
      email: resumeData.email || "",
      phone: resumeData.phone || "",
      address: resumeData.address || "",
      location: resumeData.location || "",
      city: resumeData.city || "",
      country: resumeData.country || "",
      linkedin: resumeData.linkedin || "",
      github: resumeData.github || "",
      twitter: resumeData.twitter || "",
      portfolioUrl: resumeData.portfolioUrl || "",
    },
  });

  const [photo, setPhoto] = useState<File | null>();
  // Add this to your file input handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const maxSize = 1024 * 1024 * 4; // 4MB
      const fileSizeMB = file.size / (1024 * 1024);

      if (file.size > maxSize) {
        alert(
          `File too large: ${fileSizeMB.toFixed(1)}MB. Please select an image under 4MB.`,
        );
        e.target.value = ""; // Clear the input
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          `Invalid file type: ${file.type}. Please select a JPG, PNG, or WebP image.`,
        );
        e.target.value = "";
        return;
      }

      // File is valid, proceed with upload
      setPhoto(file); // or whatever your state setter is
    }
  };

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({ ...resumeData, ...values });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Personal Details</h2>
        <p className="text-muted-foreground text-sm italic">
          Tell us about yourself. This information will not be displayed on your
          resume.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
<FormField
  control={form.control}
  name="photo"
  render={({ field: { value, ...fieldValues } }) => {
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB - align with backend
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // TEMPORARY: Test with hardcoded URL (remove after testing)
    // const testValue = value || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face";
    
    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
      }
      
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
      }
      
      return null;
    };

    return (
      <FormItem>
        <FormLabel>Your Photo</FormLabel>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 p-2 bg-gray-100 rounded">
            <strong>Debug:</strong> Value type: {typeof value}, 
            Is File: {value instanceof File ? 'Yes' : 'No'}, 
            Value: {value instanceof File ? value.name : String(value)}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Current photo preview */}
          {(value instanceof File || (typeof value === 'string' && value)) && (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={
                    value instanceof File
                      ? URL.createObjectURL(value)
                      : value // This would be the existing photo URL from database
                  }
                  alt="Profile photo preview"
                  fill
                  className="object-cover"
                  onLoad={(e) => {
                    // Cleanup object URL after image loads to prevent memory leaks
                    if (value instanceof File) {
                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                    }
                  }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {value instanceof File ? (
                  <>
                    <p className="font-medium">{value.name}</p>
                    <p className="text-xs">
                      {(value.size / (1024 * 1024)).toFixed(2)} MB • {value.type}
                    </p>
                    <p className="text-xs text-green-600">✓ Valid file</p>
                  </>
                ) : (
                  <p className="font-medium">Current photo</p>
                )}
              </div>
            </div>
          )}
          
          {/* File input and controls */}
          <div className="flex items-center gap-2">
            <FormControl>
              <Input
                {...fieldValues}
                placeholder="Upload your photo (optional - only include if job requires it)"
                type="file"
                accept={ALLOWED_TYPES.join(',')} // More specific accept attribute
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  
                  if (file) {
                    console.log('File selected:', {
                      name: file.name,
                      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                      type: file.type,
                      lastModified: new Date(file.lastModified).toISOString()
                    });

                    // Validate the file
                    const validationError = validateFile(file);
                    
                    if (validationError) {
                      console.error('File validation failed:', validationError);
                      
                      // Set form error
                      form.setError('photo', {
                        type: 'manual',
                        message: validationError
                      });
                      
                      // Clear the input
                      if (photoInputRef.current) {
                        photoInputRef.current.value = "";
                      }
                      return;
                    }
                    
                    // Clear any previous errors
                    form.clearErrors('photo');
                    
                    // File is valid, set it
                    fieldValues.onChange(file);
                    console.log('✅ File validation passed, file set');
                    
                  } else {
                    fieldValues.onChange(undefined);
                    form.clearErrors('photo');
                  }
                }}
                ref={photoInputRef}
                className="flex-1"
              />
            </FormControl>
            
            {/* Remove button - only show if there's a photo */}
            {(value instanceof File || (typeof value === 'string' && value)) && (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  console.log('Removing photo...');
                  fieldValues.onChange(null); // This will trigger deletion of existing photo
                  form.clearErrors('photo');
                  if (photoInputRef.current) {
                    photoInputRef.current.value = "";
                  }
                }}
                className="px-3 py-2"
              >
                Remove
              </Button>
            )}
          </div>
          
          {/* Help text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Please only include a photo if the job requires it</p>
            <p>• Maximum file size: <strong>4MB</strong></p>
            <p>• Accepted formats: <strong>JPG, PNG, WebP</strong></p>
            <p>• Recommended: Square photos work best (400x400px)</p>
          </div>
        </div>
        <FormMessage />
      </FormItem>
    );
  }}
/>{" "}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="First Name e.g. Sibusiso" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Last Name e.g. Zulu" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Job Title e.g. Senior Developer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone e.g. +27712345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email e.g. sibusiso@gmail.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Address e.g. 123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Location e.g. Soweto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City e.g. Johannesburg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Country e.g. South Africa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linkedin Link</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Linkedin Link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Github Link</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Github Link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio Link</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Portfolio Link" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
