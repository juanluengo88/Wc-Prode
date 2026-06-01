
export default  async function fetchTeam(teamId : any){
    try{
        const response = await fetch(`/api/teams/${teamId}`)

        return await response.json()
    }catch(err){
        console.error("error while fetching team", err)
    }
}