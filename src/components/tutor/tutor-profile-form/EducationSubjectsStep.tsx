import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Trash2, Plus, X, Search, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Controller, UseFormReturn } from 'react-hook-form';
import { getCommonSubjects, SUBJECT_CATEGORIES, TutorFormData } from './types';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

interface EducationSubjectsStepProps {
    form: UseFormReturn<TutorFormData>
    educationFields: Array<{ id: string }>
    subjectFields: Array<{ id: string }>
    removeEducation: (index: number) => void
    appendEducation: (value: { degree: string; institution: string; location: string; dateRange: { startDate: string; endDate: string }; description: string }) => void
    removeSubject: (index: number) => void
    appendSubject: (value: { category: string; items: string[] }) => void
}


interface SubjectInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    category: string;
    onCategoryChange: (newCategory: string) => void;
}

const SubjectInput = ({ value, onChange, category, onCategoryChange }: SubjectInputProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);

    // Filter out any empty strings from the value array
    const filteredValue = value.filter(subject => subject.trim() !== '');

    const suggestions = getCommonSubjects(category);
    const filteredSuggestions = suggestions.filter(
        subject => subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addSubject = (subject: string) => {
        if (subject.trim() && !filteredValue.includes(subject)) {
            onChange([...filteredValue, subject]);
        }
        setSearchQuery('');
        setOpen(false);
    };

    const removeSubject = (subjectToRemove: string) => {
        onChange(filteredValue.filter(subject => subject !== subjectToRemove));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {filteredValue.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        {subject}
                        <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                {filteredValue.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">
                        No subjects added yet
                    </div>
                )}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        Add subjects...
                        <Search className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Search subjects..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>No subjects found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {filteredSuggestions.map((subject) => (
                                    <CommandItem
                                        key={subject}
                                        onSelect={() => addSubject(subject)}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={`
                        mr-2 h-4 w-4 
                        ${filteredValue.includes(subject) ? "opacity-100" : "opacity-0"}
                      `}
                                        />
                                        {subject}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            {searchQuery && !filteredSuggestions.includes(searchQuery) && (
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => addSubject(searchQuery)}
                                        className="cursor-pointer"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add "{searchQuery}"
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default function EducationSubjectsStep({ form, educationFields, subjectFields, removeEducation, appendEducation, removeSubject, appendSubject }: EducationSubjectsStepProps) {
    return (
        <Card>
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-8 mb-4">
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-violet-600" />
                    Education & Subjects
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Education */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Education</Label>
                    {educationFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Education #{index + 1}</h4>
                                    {educationFields.length > 1 && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => removeEducation(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Degree *</Label>
                                        <Input
                                            placeholder="e.g., Bachelor of Science"
                                            {...form.register(`education.${index}.degree` as const)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Institution *</Label>
                                        <Input
                                            placeholder="e.g., Harvard University"
                                            {...form.register(`education.${index}.institution` as const)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location *</Label>
                                        <Input
                                            placeholder="e.g., Cambridge, MA"
                                            {...form.register(`education.${index}.location` as const)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor={`education-${index}-startDate`} >
                                                Start Date *
                                            </Label>
                                            <Input
                                                id={`education-${index}-startDate`}
                                                type="month"
                                                placeholder="MM/YYYY"
                                                {...form.register(`education.${index}.dateRange.startDate` as const)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`education-${index}-endDate`} >
                                                End Date *
                                            </Label>
                                            <Input
                                                id={`education-${index}-endDate`}
                                                type="month"
                                                placeholder="MM/YYYY or Present"
                                                {...form.register(`education.${index}.dateRange.endDate` as const)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Additional details about your education..."
                                        {...form.register(`education.${index}.description` as const)}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            appendEducation({ degree: "", institution: "", location: "", dateRange: { startDate: "", endDate: "" }, description: "" })
                        }
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                    </Button>
                </div>

                {/* Subjects */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Subjects</Label>
                    {subjectFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Subject Category #{index + 1}</h4>
                                    {subjectFields.length > 1 && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => removeSubject(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Controller
                                        name={`subjects.${index}.category`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between"
                                                    >
                                                        {field.value || "Select category..."}
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search category..." />
                                                        <CommandList>
                                                            <CommandEmpty>No category found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {SUBJECT_CATEGORIES.map((category) => (
                                                                    <CommandItem
                                                                        key={category}
                                                                        value={category}
                                                                        onSelect={() => {
                                                                            // Clear subjects when category changes
                                                                            form.setValue(`subjects.${index}.items`, []);
                                                                            field.onChange(category);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={`
                              mr-2 h-4 w-4 
                              ${field.value === category ? "opacity-100" : "opacity-0"}
                            `}
                                                                        />
                                                                        {category}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Subjects</Label>
                                    <Controller
                                        name={`subjects.${index}.items`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <SubjectInput
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                category={form.watch(`subjects.${index}.category`) || ""}
                                                onCategoryChange={(newCategory) => {
                                                    // This prop is no longer needed but kept for consistency
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendSubject({ category: "", items: [] })}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject Category
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}