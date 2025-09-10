import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Award, Globe, Plus, Trash2, ImageIcon, Check, ChevronDown, X, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { UseFormReturn } from "react-hook-form"
import { LANGUAGES, TutorFormData } from "./types"

interface ProfessionalDetailsStepProps {
    form: UseFormReturn<TutorFormData>
    certificationFields: any
    appendCertification: any
    removeCertification: any
    uploadingImages: { [key: string]: boolean }
    handleImageUpload: (file: File, certificationIndex: number) => void
    languagesOpen: boolean
    setLanguagesOpen: (open: boolean) => void
}


export default function ProfessionalDetailsStep({
    form,
    certificationFields,
    appendCertification,
    removeCertification,
    uploadingImages,
    handleImageUpload,
    languagesOpen,
    setLanguagesOpen
}: ProfessionalDetailsStepProps) {
    return (
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-8">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-6 w-6 text-green-600" />
                    Professional Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                        <Input
                            id="hourlyRate"
                            type="number"
                            min="1"
                            placeholder="25"
                            {...form.register("hourlyRate", { valueAsNumber: true })}
                        />
                        {form.formState.errors.hourlyRate && (
                            <p className="text-sm text-destructive">{form.formState.errors.hourlyRate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experienceYears">Years of Experience *</Label>
                        <Input
                            id="experienceYears"
                            type="number"
                            min="0"
                            placeholder="5"
                            {...form.register("experienceYears", { valueAsNumber: true })}
                        />
                        {form.formState.errors.experienceYears && (
                            <p className="text-sm text-destructive">{form.formState.errors.experienceYears.message}</p>
                        )}
                    </div>
                </div>

                {/* Class Type */}
                <div className="space-y-2">
                    <Label>Class Type</Label>
                    <RadioGroup
                        value={form.watch("classType")}
                        onValueChange={(value) => form.setValue("classType", value as "OneToOne" | "Group")}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OneToOne" id="onetoone" />
                            <Label htmlFor="onetoone">One-to-One</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Group" id="group" />
                            <Label htmlFor="group">Group</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Teaching Services */}
                <div className="space-y-2">
                    <Label>Teaching Services</Label>
                    <div className="grid grid-cols-2 gap-4">
                        {["Online", "Offline", "StudentPlace", "TutorPlace"].map((service) => (
                            <div key={service} className="flex items-center space-x-2">
                                <Checkbox
                                    id={service}
                                    checked={form.watch("teachingServices")?.includes(service as any)}
                                    onCheckedChange={(checked) => {
                                        const currentServices = form.getValues("teachingServices") || []
                                        if (checked) {
                                            form.setValue("teachingServices", [...currentServices, service as "Online" | "Offline" | "StudentPlace" | "TutorPlace"])
                                        } else {
                                            form.setValue(
                                                "teachingServices",
                                                currentServices.filter((s) => s !== service)
                                            )
                                        }
                                    }}
                                />
                                <Label htmlFor={service}>
                                    {service === "StudentPlace"
                                        ? "Student's Place"
                                        : service === "TutorPlace"
                                            ? "Tutor's Place"
                                            : service}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamic Lists */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            Certifications & Credentials
                        </Label>
                        <p className="text-sm text-slate-600">Add your professional certifications with supporting images</p>

                        <div className="space-y-4">
                            {certificationFields.map((field: any, index: number) => (
                                <div key={field.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-slate-600 mb-2 block">Certification Name</Label>
                                            <Input
                                                placeholder="e.g., TESOL Certificate, Teaching License"
                                                className="h-11"
                                                {...form.register(`certifications.${index}.name` as const)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeCertification(index)}
                                            className="mt-7 h-11 w-11 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-slate-600">Certificate Image (Optional)</Label>
                                        <div className="flex items-center gap-4">
                                            {form.watch(`certifications.${index}.imageUrl`) && (
                                                <div className="relative">
                                                    <img
                                                        src={form.watch(`certifications.${index}.imageUrl`) || "/placeholder.svg"}
                                                        alt="Certificate"
                                                        className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md"
                                                        onClick={() => form.setValue(`certifications.${index}.imageUrl`, "")}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Image URL or upload file"
                                                        className="flex-1"
                                                        {...form.register(`certifications.${index}.imageUrl` as const)}
                                                    />
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) {
                                                                    handleImageUpload(file, index)
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={uploadingImages[`cert-${index}`]}
                                                            className="relative bg-transparent"
                                                        >
                                                            {uploadingImages[`cert-${index}`] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                                                            ) : (
                                                                <ImageIcon className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Upload a clear image of your certificate for verification
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendCertification({ name: "", imageUrl: "" })}
                            className="w-full h-12 border-dashed border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Another Certification
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Languages
                        </Label>
                        <Popover open={languagesOpen} onOpenChange={setLanguagesOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={languagesOpen}
                                    className="w-full justify-between min-h-[60px] p-3 bg-transparent"
                                >
                                    <div className="flex flex-wrap gap-1">
                                        {form.watch("languages")?.length > 0 ? (
                                            form.watch("languages").map((language) => (
                                                <Badge key={language} variant="secondary" className="flex items-center gap-1">
                                                    {language}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            form.setValue(
                                                                "languages",
                                                                form.getValues("languages").filter((l) => l !== language)
                                                            )
                                                        }}
                                                    />
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Select languages...</span>
                                        )}
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search languages..." />
                                    <CommandList>
                                        <CommandEmpty>No language found.</CommandEmpty>
                                        <CommandGroup>
                                            {LANGUAGES.map((language) => (
                                                <CommandItem
                                                    key={language}
                                                    onSelect={() => {
                                                        const currentLanguages = form.getValues("languages") || []
                                                        if (currentLanguages.includes(language)) {
                                                            form.setValue(
                                                                "languages",
                                                                currentLanguages.filter((l) => l !== language)
                                                            )
                                                        } else {
                                                            form.setValue("languages", [...currentLanguages, language])
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            form.watch("languages")?.includes(language) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {language}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}