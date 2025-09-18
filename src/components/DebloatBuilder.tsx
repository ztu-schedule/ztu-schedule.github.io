import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ExternalLink } from "lucide-react"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import GroupCombobox from "./GroupCombobox"
import ElectivesCombobox from "./ElectivesCombobox"
import { Card, CardContent, CardFooter } from "./ui/card";

import english from "./data/english.json";

const daysOfWeek = [
  { id: 1, label: "Понеділок" },
  { id: 2, label: "Вівторок" },
  { id: 3, label: "Середа" },
  { id: 4, label: "Четвер" },
  { id: 5, label: "П'ятниця" },
  { id: 6, label: "Субота" },
]

const formSchema = z.object({
  group: z.string().min(1, "Please select a group"),
  subgroup: z.string().min(1, "Please select a subgroup"),
  should_filter_electives_by_group: z.boolean(),
  days_with_electives: z.array(z.set(z.number())).length(2),
  electives: z.array(z.string()),
  english_teacher: z.string().min(1, "Please select an English teacher"),
})

export default function DebloatBuilder() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group: "",
      subgroup: "",
      should_filter_electives_by_group: true,
      days_with_electives: [new Set([5, 6]), new Set([2, 5, 6])],
      electives: [],
      english_teacher: "",
    },
  })

  const control = form.control;
  let watchGroup = form.watch("group", "");
  let watchAll = form.watch();


  let rawURL = React.useMemo(() => {
    let params = new URLSearchParams();
    params.set("group", watchAll.group);
    params.set("subgroup", watchAll.subgroup);
    params.set("should_filter_electives_by_group", watchAll.should_filter_electives_by_group.toString());
    params.set("english", watchAll.english_teacher);
    watchAll.electives.forEach(e => params.append("electives", e));
    watchAll.days_with_electives[0].forEach(d => params.append("days_with_electives[1]", d.toString()));
    watchAll.days_with_electives[1].forEach(d => params.append("days_with_electives[2]", d.toString()));

    return "https://debloater.anyduck.workers.dev/filters.txt?" + params.toString();
  }, [watchAll]);

  let subURL = React.useMemo(() => {
    let params = new URLSearchParams();
    params.set("location", rawURL);
    params.set("title", "ZTU Schedule");

    return "adp:subscribe?" + params.toString();
  }, [rawURL]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <Card className="mx-auto w-full max-w-md">
        <CardContent>
          <form onSubmit={form.handleSubmit(() => { })} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField control={control} name="group" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Група</FormLabel>
                  <GroupCombobox value={field.value} setValue={field.onChange} />
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={control} name="subgroup" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Підгрупа</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchGroup}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть підгрупу..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Підгрупа 1</SelectItem>
                      <SelectItem value="2">Підгрупа 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={control} name="electives" render={({ field }) => (
              <FormItem>
                <FormLabel>Вибіркові</FormLabel>
                <ElectivesCombobox selectedElectives={field.value} setSelectedElectives={field.onChange} />
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={control} name="should_filter_electives_by_group" render={({ field }) => (
              <FormItem className="flex items-center -mt-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-base">
                  Приховувати практичні не з вашою групою
                </FormLabel>
              </FormItem>
            )} />

            <FormField control={control} name="days_with_electives" render={({ field }) => (
              <FormItem className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {field.value.map((set, index) => {
                  return (
                    <div className="flex flex-col space-y-2" key={`week_${index}`}>
                      <FormLabel className="font-normal">Тиждень {index + 1}</FormLabel>
                      {daysOfWeek.map((day) => (
                        <FormItem
                          key={`${index}_${day.id}`}
                          className="flex items-start space-x-3 px-1"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value[index].has(day.id)}
                              onCheckedChange={(checked) => {
                                checked ? field.value[index].add(day.id) : field.value[index].delete(day.id);
                                field.onChange([field.value[0], field.value[1]])
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )
                      )}
                    </div>
                  )
                })}
              </FormItem>
            )} />

            <FormDescription>TODO: Витягувати дні з вибіркими автоматично за групою</FormDescription>

            <FormField control={control} name="english_teacher" render={({ field }) => (
              <FormItem>
                <FormLabel>Викладач іноземної мови</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть викладача..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {english.map((teacher) => (
                      <SelectItem key={teacher.value} value={teacher.value}>
                        {teacher.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </CardContent>
        <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Button asChild={true}>
            <a href={subURL} className={!watchGroup ? "pointer-events-none opacity-50" : ""}>
              Додати
            </a>
          </Button>
          <Button asChild={true} variant="neutral">
            <a href={rawURL} className={!watchGroup ? "pointer-events-none opacity-50" : ""} target="_blank">
              Переглянути<ExternalLink />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </Form>
  )
}