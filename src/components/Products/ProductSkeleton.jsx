export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-[#E5DFD5] rounded-none overflow-hidden flex flex-col h-full animate-pulse">
      <div className="relative aspect-[3/4] bg-[#EAE6DF] w-full" />
      <div className="p-4 flex flex-col flex-grow justify-between gap-3 bg-white">
        <div className="space-y-2">
          <div className="h-2.5 w-16 bg-[#E5DFD5] rounded-xs" />
          <div className="h-4 w-3/4 bg-[#DCD6CC] rounded-xs" />
          <div className="h-4 w-1/2 bg-[#DCD6CC] rounded-xs" />
        </div>
        <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between">
          <div className="h-4 w-14 bg-[#DCD6CC] rounded-xs" />
          <div className="h-7 w-20 bg-[#E5DFD5] rounded-xs" />
        </div>
      </div>
    </div>
  )
}
