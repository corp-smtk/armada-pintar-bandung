import { useState, useEffect } from 'react';
import { Plus, X, Users, Mail, Building2, Settings, Upload, Download, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { localStorageService } from '@/services/LocalStorageService';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description: string;
  contactIds: string[];
  isDefault: boolean;
  createdAt: string;
}

interface EmailTargetingManagerProps {
  selectedContacts: string[];
  onContactsChange: (contacts: string[]) => void;
  onClose?: () => void;
}

const EmailTargetingManager = ({ selectedContacts, onContactsChange, onClose }: EmailTargetingManagerProps) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [activeTab, setActiveTab] = useState('quick');
  
  // Add Contact Form
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    tags: ''
  });

  // Add Group Form
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    contactIds: [] as string[]
  });

  // Load data on mount
  useEffect(() => {
    loadContacts();
    loadGroups();
  }, []);

  const loadContacts = () => {
    const savedContacts = localStorage.getItem('fleet_email_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      // Initialize with default contacts
      const defaultContacts: Contact[] = [
        {
          id: '1',
          name: 'Fleet Manager',
          email: 'fleet@company.com',
          role: 'Manager',
          department: 'Operations',
          isActive: true,
          tags: ['management', 'operations'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Maintenance Team',
          email: 'maintenance@company.com',
          role: 'Technician',
          department: 'Maintenance',
          isActive: true,
          tags: ['maintenance', 'technical'],
          createdAt: new Date().toISOString()
        }
      ];
      setContacts(defaultContacts);
      localStorage.setItem('fleet_email_contacts', JSON.stringify(defaultContacts));
    }
  };

  const loadGroups = () => {
    const savedGroups = localStorage.getItem('fleet_email_groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      // Initialize with default groups
      const defaultGroups: ContactGroup[] = [
        {
          id: '1',
          name: 'Management Team',
          description: 'Fleet managers and supervisors',
          contactIds: ['1'],
          isDefault: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Technical Team',
          description: 'Maintenance and technical staff',
          contactIds: ['2'],
          isDefault: false,
          createdAt: new Date().toISOString()
        }
      ];
      setGroups(defaultGroups);
      localStorage.setItem('fleet_email_groups', JSON.stringify(defaultGroups));
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContact.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      role: newContact.role,
      department: newContact.department,
      isActive: true,
      tags: newContact.tags ? newContact.tags.split(',').map(t => t.trim()) : [],
      createdAt: new Date().toISOString()
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    localStorage.setItem('fleet_email_contacts', JSON.stringify(updatedContacts));

    // Reset form
    setNewContact({ name: '', email: '', role: '', department: '', tags: '' });
    setShowAddContact(false);

    toast({
      title: "Contact Added",
      description: `${contact.name} has been added to your contacts`,
    });
  };

  const addGroup = () => {
    if (!newGroup.name) {
      toast({
        title: "Validation Error",
        description: "Group name is required",
        variant: "destructive"
      });
      return;
    }

    const group: ContactGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      contactIds: newGroup.contactIds,
      isDefault: false,
      createdAt: new Date().toISOString()
    };

    const updatedGroups = [...groups, group];
    setGroups(updatedGroups);
    localStorage.setItem('fleet_email_groups', JSON.stringify(updatedGroups));

    // Reset form
    setNewGroup({ name: '', description: '', contactIds: [] });
    setShowAddGroup(false);

    toast({
      title: "Group Created",
      description: `Group "${group.name}" has been created`,
    });
  };

  const toggleContactSelection = (contactEmail: string) => {
    const isSelected = selectedContacts.includes(contactEmail);
    if (isSelected) {
      onContactsChange(selectedContacts.filter(email => email !== contactEmail));
    } else {
      onContactsChange([...selectedContacts, contactEmail]);
    }
  };

  const selectGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const groupEmails = contacts
        .filter(c => group.contactIds.includes(c.id))
        .map(c => c.email);
      onContactsChange([...new Set([...selectedContacts, ...groupEmails])]);
      
      toast({
        title: "Group Selected",
        description: `Added ${groupEmails.length} contacts from "${group.name}"`,
      });
    }
  };

  const exportContacts = () => {
    const data = { contacts, groups };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-contacts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Email Targeting Manager
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportContacts}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Manage email contacts and groups for reminder notifications
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick">Quick Select</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          {/* Quick Select Tab */}
          <TabsContent value="quick" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Popular Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => selectGroup(group.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{group.name}</h4>
                      <Badge variant="outline">
                        {contacts.filter(c => group.contactIds.includes(c.id)).length} contacts
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold">Individual Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contacts.filter(c => c.isActive).map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedContacts.includes(contact.email)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleContactSelection(contact.email)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-600">{contact.email}</p>
                      </div>
                      {selectedContacts.includes(contact.email) && (
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Manage Contacts</h3>
              <Button 
                size="sm"
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </div>

            {showAddContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        placeholder="email@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={newContact.role}
                        onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                        placeholder="Manager, Driver, Technician"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newContact.department}
                        onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                        placeholder="Operations, Maintenance"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newContact.tags}
                      onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                      placeholder="management, technical, urgent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addContact}>Add Contact</Button>
                    <Button variant="outline" onClick={() => setShowAddContact(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    <div className="flex gap-1 mt-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={contact.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {contact.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Manage Groups</h3>
              <Button 
                size="sm"
                onClick={() => setShowAddGroup(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </div>

            {showAddGroup && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="e.g., Management Team"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="Group description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Contacts</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {contacts.map((contact) => (
                        <label key={contact.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newGroup.contactIds.includes(contact.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewGroup({
                                  ...newGroup,
                                  contactIds: [...newGroup.contactIds, contact.id]
                                });
                              } else {
                                setNewGroup({
                                  ...newGroup,
                                  contactIds: newGroup.contactIds.filter(id => id !== contact.id)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <p className="text-sm font-semibold">{contact.name}</p>
                            <p className="text-xs text-gray-600">{contact.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addGroup}>Create Group</Button>
                    <Button variant="outline" onClick={() => setShowAddGroup(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{group.name}</h4>
                    <Badge variant="outline">
                      {contacts.filter(c => group.contactIds.includes(c.id)).length} contacts
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contacts
                      .filter(c => group.contactIds.includes(c.id))
                      .map(contact => (
                        <Badge key={contact.id} variant="outline" className="text-xs">
                          {contact.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualEmails">Manual Email Entry</Label>
              <Textarea
                id="manualEmails"
                value={selectedContacts.join(', ')}
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email);
                  onContactsChange(emails);
                }}
                placeholder="Enter email addresses separated by commas"
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500">
                Example: admin@company.com, manager@company.com, driver@company.com
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Recipients Summary */}
        <div className="border-t pt-4 mt-6">
          <h3 className="font-semibold mb-2">Selected Recipients ({selectedContacts.length})</h3>
          <div className="flex flex-wrap gap-1">
            {selectedContacts.map((email, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {email}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleContactSelection(email)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTargetingManager; 