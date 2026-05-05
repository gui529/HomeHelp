function p(id: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400`
}

export const CATEGORY_IMAGES: Record<string, string[]> = {
  plumbing: [
    p(6419128),  // plumber installing pipe fittings
    p(14308927), // plumber working on street
    p(8486928),  // handywoman with plumber's wrench
    p(7859953),  // plumber repairing power source
    p(586019),   // steel pipe lines with pressure gauge
  ],
  electricians: [
    p(257736),   // electrician fixing switchboard
    p(5691590),  // electrician repairing AC plugs
    p(27928762), // man working on electrical panel
    p(11477908), // men repairing electric lines
    p(10130749), // two electricians on utility pole
  ],
  airconditioningheating: [
    p(27134985), // AC unit outside building
    p(16848596), // air conditioner on wall
    p(20046692), // air conditioner on outside wall
    p(3964692),  // air conditioning system in yard
    p(5539540),  // building wall with air conditioners
  ],
  roofing: [
    p(1453799),  // brown roof shingles
    p(28954789), // historic shingle roof with dormer windows
    p(18098285), // house with shingles roof
    p(5668698),  // damaged roof tiles
    p(7788264),  // construction worker on the roof
  ],
  paintingcontractors: [
    p(5691471),  // house painter undercoating wall
    p(1917849),  // man painting a house exterior
    p(6474471),  // man painting interior wall
    p(7218003),  // couple painting wall
    p(994164),   // person holding paint roller
  ],
  landscaping: [
    p(9229821),  // lawnmower on grass
    p(4162011),  // lawn mower on grass
    p(6728933),  // man mowing lawn
    p(6728919),  // person using lawn mower
    p(11364122), // person using lawn mower sunny day
  ],
  pestcontrol: [
    p(4176539),  // person in PPE spraying smoke
    p(6474117),  // man in PPE with gas mask
    p(4097848),  // person in PPE holding spray bottle
    p(4176608),  // person in protective suit spraying floor
    p(4114442),  // person in gas mask and white suit
  ],
  homecleaning: [
    p(7641496),  // woman cleaning the floor
    p(4440541),  // woman mopping the floor
    p(6196566),  // person mopping and cleaning floor
    p(9462746),  // woman cleaning a kitchen
    p(9462341),  // women cleaning the bedroom
  ],
  generalcontractors: [
    p(10202865), // construction workers on building site
    p(4515180),  // builder working on brick wall
    p(8293646),  // contractor checking socket
    p(5493654),  // construction workers renovating house
    p(159306),   // men on construction site
  ],
  locksmiths: [
    p(7641991),  // keys inserted in door lock
    p(29940222), // office locker with key
    p(7578995),  // lock box on doorknob
    p(164425),   // gold padlock on door
    p(31651009), // hand holding house keys
  ],
}
