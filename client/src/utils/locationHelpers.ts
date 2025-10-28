// Project location utilities and helpers

// Extract base location from a full location string
export const extractBaseLocation = (location: string): string => {
  // Remove specific work details after the dash
  const parts = location.split(' - ')
  return parts[0]?.trim() || location
}

// Get common location patterns for suggestions
export const getCommonLocationPatterns = (locations: string[]): string[] => {
  const baseLocations = locations.map(extractBaseLocation)
  const patterns = new Map<string, number>()
  
  baseLocations.forEach(base => {
    patterns.set(base, (patterns.get(base) || 0) + 1)
  })
  
  // Return locations that appear more than once, sorted by frequency
  return Array.from(patterns.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([location, _]) => location)
}

// Generate location suggestions based on existing projects
export const generateLocationSuggestions = (
  existingLocations: string[], 
  currentInput: string
): string[] => {
  if (!currentInput.trim()) return []
  
  const input = currentInput.toLowerCase()
  
  // Filter locations that match the input
  const matches = existingLocations.filter(location => 
    location.toLowerCase().includes(input)
  )
  
  // Also suggest base locations if they match
  const baseMatches = existingLocations
    .map(extractBaseLocation)
    .filter(base => base.toLowerCase().includes(input))
    .filter((base, index, self) => self.indexOf(base) === index) // Remove duplicates
  
  // Combine and remove duplicates
  const allSuggestions = [...new Set([...matches, ...baseMatches])]
  
  // Sort by relevance (exact matches first, then partial matches)
  return allSuggestions.sort((a, b) => {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()
    
    if (aLower === input) return -1
    if (bLower === input) return 1
    if (aLower.startsWith(input)) return -1
    if (bLower.startsWith(input)) return 1
    return a.localeCompare(b)
  }).slice(0, 5) // Limit to 5 suggestions
}

// Check if multiple locations share the same base
export const findSimilarLocations = (
  targetLocation: string, 
  allLocations: string[]
): string[] => {
  const baseTarget = extractBaseLocation(targetLocation)
  return allLocations.filter(location => {
    const baseLocation = extractBaseLocation(location)
    return baseLocation === baseTarget && location !== targetLocation
  })
}