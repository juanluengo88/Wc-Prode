
const handleGroupChange = async (groupId: string) => {
  
  const response = await fetch(`/api/groups/${groupId}/leaderboard`);
  const data = await response.json();
  
  if (data.success) {
    setUsersInActiveGroup(data.leaderboard); 
  }
  
};