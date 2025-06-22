// Mock database - replace with your actual database
let categoriesData = {
  balloons: {
    name: "Balloons",
    description: "Party and celebration balloons",
    subcategories: ["Party Balloons", "Wedding Balloons", "Birthday Balloons", "Seasonal Balloons"],
    occasions: [
      "Wedding",
      "Anniversary",
      "Valentine's Day",
      "Graduation",
      "Baby Shower",
      "Halloween",
      "Christmas",
      "Birthday",
      "New Year",
    ],
    types: [
      "Confetti",
      "LED",
      "Helium-filled",
      "Air-filled",
      "Biodegradable",
      "Stuffed",
      "Mini",
      "Starred",
      "Large",
      "Jumbo",
      "Custom",
    ],
    colors: ["Pink", "Blue", "Gold", "Silver", "Multi-color", "Green", "Red", "Purple", "Orange", "White"],
    finishes: ["Matte", "Chrome", "Confetti", "Glitter", "Pearlescent", "Transparent", "Metallic"],
    sizes: ['Mini (6")', 'Standard (11")', 'Large (18")', 'Jumbo (36")', 'Giant (40"+)'],
  },
  cards: {
    name: "Cards",
    description: "Greeting cards and stationery",
    subcategories: ["Greeting Cards", "Birthday Cards", "Wedding Cards", "Thank You Cards"],
    occasions: [
      "Wedding",
      "Anniversary",
      "Sympathy",
      "Congratulations",
      "Thank You",
      "Get Well",
      "Birthday",
      "Valentine's Day",
      "Christmas",
      "Mother's Day",
      "Father's Day",
    ],
    recipients: ["Friend", "Family", "Partner", "Colleague", "Parent", "Child", "Boss", "Teacher"],
    styles: ["Artistic", "Photo", "Pop-up", "Musical", "Handmade", "Vintage", "Modern", "Minimalist"],
    colors: ["Pink", "Blue", "White", "Gold", "Silver", "Red", "Green", "Purple"],
    formats: ["A4", "A5", "Square", "Postcard", "Folded", "Single Panel"],
  },
  "home-living": {
    name: "Home & Living",
    description: "Home decor and living accessories",
    subcategories: ["Wall Decor", "Table Decor", "Garden Items", "Lighting", "Storage"],
    productTypes: ["Frames", "Candles", "Decor", "Garden items", "Cushions", "Vases", "Mirrors", "Clocks"],
    colors: ["White", "Black", "Gold", "Silver", "Blue", "Green", "Brown", "Gray", "Beige"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    materials: ["Wood", "Metal", "Glass", "Ceramic", "Fabric", "Plastic", "Stone"],
    rooms: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garden", "Office", "Dining Room"],
    styles: ["Modern", "Vintage", "Rustic", "Minimalist", "Industrial", "Scandinavian", "Bohemian"],
  },
}

export async function GET() {
  try {
    // In a real app, fetch from your database
    return Response.json(categoriesData)
  } catch (error) {
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const updatedCategories = await request.json()

    // Validate the categories structure
    for (const [key, category] of Object.entries(updatedCategories)) {
      if (!category.name) {
        return Response.json({ error: `Category ${key} is missing a name` }, { status: 400 })
      }
    }

    // In a real app, save to your database
    categoriesData = updatedCategories

    console.log("Categories updated successfully:", Object.keys(updatedCategories))

    return Response.json({
      success: true,
      message: "Categories updated successfully",
      categories: updatedCategories,
      count: Object.keys(updatedCategories).length,
    })
  } catch (error) {
    console.error("Error updating categories:", error)
    return Response.json({ error: "Failed to update categories" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { categoryKey } = await request.json()

    if (categoriesData[categoryKey]) {
      delete categoriesData[categoryKey]
      return Response.json({
        success: true,
        message: "Category deleted successfully",
      })
    } else {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }
  } catch (error) {
    return Response.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
