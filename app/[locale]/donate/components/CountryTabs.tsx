import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Country } from '../types'

interface CountryTabsProps {
  value: Country
  onValueChange: (value: Country) => void
}

export function CountryTabs({ value, onValueChange }: CountryTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as Country)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="india">India</TabsTrigger>
        <TabsTrigger value="us">United States</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
