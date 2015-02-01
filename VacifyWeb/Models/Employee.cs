using System;
using System.Collections.Generic;

namespace VacifyWeb.Models
{
    public class Employee
    {
        public string Name { get; set; }
        public string PictureUrl { get; set; }
        public string Manager { get; set; }
        public List<string> Employees { get; set; }
    }
}